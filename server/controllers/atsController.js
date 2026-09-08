const crypto = require('crypto');
const PDFDocument = require('pdfkit');
const { PDFParse } = require('pdf-parse');
const mongoose = require('mongoose');
const AtsScan = require('../models/AtsScan');
const AtsArtifact = require('../models/AtsArtifact');
const Resume = require('../models/Resume');
const TargetJob = require('../models/TargetJob');
const {
  ATS_ANALYSIS_VERSION,
  ATS_RESUME_VERSION,
  analyzeResume,
  generateTailoredResume,
  rescoreTailoredResume,
  trimResumeText
} = require('../services/atsAIService');

const ATS_MAX_TEXT = 30000;

const getStudentIds = (user) => [...new Set([
  user?._id ? String(user._id) : '',
  user?.studentId ? String(user.studentId) : ''
].filter(Boolean))];

const ownsResume = (resume, user) => {
  const ids = getStudentIds(user);
  return Boolean(resume && (
    String(resume.userId || '') === String(user._id) ||
    ids.includes(String(resume.studentId || '')) ||
    ids.includes(String(resume.student_id || ''))
  ));
};

const ownsTargetJob = (targetJob, user) => Boolean(
  targetJob && getStudentIds(user).includes(String(targetJob.student_id))
);

const canonicalTargetJob = (targetJob) => ({
  target_job_role: String(targetJob.target_job_role || '').trim(),
  target_industry: String(targetJob.target_industry || '').trim(),
  target_company: String(targetJob.target_company || '').trim(),
  experience: String(targetJob.experience || '').trim(),
  required_skills: [...(targetJob.required_skills || [])].map(String).map((value) => value.trim()).filter(Boolean).sort(),
  preferred_location: String(targetJob.preferred_location || '').trim(),
  job_type: String(targetJob.job_type || '').trim(),
  expected_salary: String(targetJob.expected_salary || '').trim(),
  job_description: String(targetJob.job_description || '').trim(),
  job_url: String(targetJob.job_url || '').trim()
});

const hashValue = (value) => crypto.createHash('sha256').update(value).digest('hex');
const hashBuffer = (buffer) => hashValue(buffer);
const hashTargetJob = (targetJob) => hashValue(JSON.stringify(canonicalTargetJob(targetJob)));

const targetJobSnapshot = (targetJob) => ({
  _id: targetJob._id,
  ...canonicalTargetJob(targetJob)
});

const projectionFromRescore = (rescore, originalScore) => {
  if (!rescore?.result || !Number.isFinite(rescore.result.overallScore) || rescore.result.overallScore < originalScore) {
    return { originalScore, projectedScore: null, scoreIncrease: null, confidence: null, explanation: [] };
  }
  const projectedScore = Math.max(0, Math.min(100, Math.round(rescore.result.overallScore)));
  return {
    originalScore,
    projectedScore,
    scoreIncrease: projectedScore - originalScore,
    confidence: projectedScore >= originalScore ? 'high' : 'low',
    explanation: rescore.result.explanation || [],
    projectedScores: rescore.result.scores,
    provider: rescore.provider,
    model: rescore.model
  };
};

const extractResumeText = async (resume) => {
  if (!resume?.fileData?.length) throw new Error('Resume PDF content is missing');
  const parser = new PDFParse({ data: resume.fileData });
  try {
    const parsed = await parser.getText();
    const text = trimResumeText(parsed.text || '').slice(0, ATS_MAX_TEXT);
    if (text.length < 40) throw new Error('Could not extract enough readable text from this PDF resume');
    return text;
  } finally {
    await parser.destroy();
  }
};

const loadOwnedInputs = async (user, resumeId, targetJobId) => {
  if (!mongoose.Types.ObjectId.isValid(resumeId) || !mongoose.Types.ObjectId.isValid(targetJobId)) {
    const error = new Error('Valid resumeId and targetJobId are required');
    error.statusCode = 400;
    throw error;
  }
  const [resume, targetJob] = await Promise.all([
    Resume.findById(resumeId),
    TargetJob.findById(targetJobId)
  ]);
  if (!ownsResume(resume, user) || !ownsTargetJob(targetJob, user)) {
    const error = new Error('Resume or target job not found');
    error.statusCode = 404;
    throw error;
  }
  return { resume, targetJob };
};

const mapAnalysisFields = (analysis) => ({
  overallScore: analysis.overallScore,
  scores: analysis.scores,
  scoreRationales: analysis.scoreRationales,
  matchedSkills: analysis.matchedSkills,
  missingSkills: analysis.missingSkills,
  matchedKeywords: analysis.matchedKeywords,
  missingKeywords: analysis.missingKeywords,
  criticalKeywords: analysis.criticalKeywords,
  strengths: analysis.strengths,
  weaknesses: analysis.weaknesses,
  improvements: analysis.improvements,
  evidence: analysis.evidence,
  recruiterSummary: analysis.recruiterSummary,
  unsupportedClaimWarnings: analysis.unsupportedClaimWarnings,
  analysis
});

const getScans = async (req, res, next) => {
  try {
    const filters = { userId: req.user._id, status: 'completed' };
    if (req.query.resumeId) filters.resumeId = req.query.resumeId;
    if (req.query.targetJobId) filters.targetJobId = req.query.targetJobId;
    const scans = await AtsScan.find(filters)
      .select('-tailoredResume -analysis -evidence -scoreRationales')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return res.json({ success: true, scans });
  } catch (error) {
    return next(error);
  }
};

const getScanById = async (req, res, next) => {
  try {
    const scan = await AtsScan.findOne({ _id: req.params.id, userId: req.user._id, status: 'completed' }).lean();
    if (!scan) return res.status(404).json({ success: false, message: 'ATS analysis not found' });
    return res.json({ success: true, scan });
  } catch (error) {
    return next(error);
  }
};

const createScan = async (req, res, next) => {
  let scan;
  try {
    const { resumeId, targetJobId } = req.body;
    const { resume, targetJob } = await loadOwnedInputs(req.user, resumeId, targetJobId);
    const resumeHash = hashBuffer(resume.fileData);
    const targetJobHash = hashTargetJob(targetJob);

    const cached = await AtsScan.findOne({
      userId: req.user._id,
      resumeHash,
      targetJobHash,
      analysisVersion: ATS_ANALYSIS_VERSION,
      status: 'completed'
    }).sort({ createdAt: -1 });
    if (cached) return res.json({ success: true, cached: true, scan: cached });

    const resumeText = await extractResumeText(resume);
    scan = await AtsScan.create({
      userId: req.user._id,
      resumeId,
      targetJobId,
      targetJob: targetJobSnapshot(targetJob),
      resumeHash,
      targetJobHash,
      analysisVersion: ATS_ANALYSIS_VERSION,
      status: 'pending'
    });

    const generated = await analyzeResume({ resumeText, targetJob: targetJobSnapshot(targetJob) });
    scan.provider = generated.provider;
    scan.model = generated.model;
    scan.status = 'completed';
    Object.assign(scan, mapAnalysisFields(generated.result));
    await scan.save();
    return res.status(201).json({ success: true, cached: false, scan });
  } catch (error) {
    if (scan) {
      scan.status = 'failed';
      scan.failureMessage = error.message;
      await scan.save().catch(() => {});
    }
    return next(error);
  }
};

const deleteScan = async (req, res, next) => {
  try {
    const scan = await AtsScan.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!scan) return res.status(404).json({ success: false, message: 'ATS analysis not found' });
    await AtsArtifact.deleteOne({ scanId: scan._id, userId: req.user._id });
    return res.json({ success: true, message: 'ATS analysis deleted successfully' });
  } catch (error) {
    return next(error);
  }
};

const createResumePdf = (resume, targetJob) => new Promise((resolve, reject) => {
  const doc = new PDFDocument({ size: 'A4', margin: 48 });
  const chunks = [];
  doc.on('data', (chunk) => chunks.push(chunk));
  doc.on('end', () => resolve(Buffer.concat(chunks)));
  doc.on('error', reject);

  const heading = (text) => {
    if (!text) return;
    doc.moveDown(0.7).fontSize(13).fillColor('#0d6efd').font('Helvetica-Bold').text(text.toUpperCase());
    doc.moveDown(0.15).strokeColor('#dbe7f5').lineWidth(1).moveTo(doc.x, doc.y).lineTo(547, doc.y).stroke();
    doc.moveDown(0.25).font('Helvetica').fillColor('#172033');
  };
  const itemText = (text) => { if (text) doc.fontSize(9.5).fillColor('#263248').text(text, { lineGap: 2 }); };

  const contact = resume.contact || {};
  doc.font('Helvetica-Bold').fontSize(20).fillColor('#102a43').text(contact.name || resume.headline || targetJob.target_job_role || 'Targeted Resume');
  if (contact.name && resume.headline) doc.moveDown(0.15).font('Helvetica').fontSize(11).fillColor('#52606d').text(resume.headline);
  const contactLine = [contact.email, contact.phone, contact.location, ...(contact.links || [])].filter(Boolean).join(' | ');
  if (contactLine) doc.moveDown(0.25).font('Helvetica').fontSize(9).fillColor('#52606d').text(contactLine);
  doc.moveDown(0.15).font('Helvetica').fontSize(9).fillColor('#52606d').text(`Tailored for ${targetJob.target_job_role || 'target role'}${targetJob.target_company ? ` at ${targetJob.target_company}` : ''}`);
  heading('Professional Summary');
  itemText(resume.professionalSummary);
  if (resume.skills?.length || resume.skillCategories?.length) {
    heading('Technical Skills');
    if (resume.skillCategories?.length) resume.skillCategories.forEach((category) => itemText(`${category.category}: ${category.skills.join(', ')}`));
    else itemText(resume.skills.join(', '));
  }
  if (resume.experience?.length) {
    heading('Experience');
    resume.experience.forEach((item) => {
      doc.font('Helvetica-Bold').fontSize(10.5).text([item.jobTitle, item.company].filter(Boolean).join(' | '));
      itemText([item.location, item.dates].filter(Boolean).join(' | '));
      (item.bullets || []).forEach((bullet) => doc.fontSize(9.5).text(`- ${bullet}`, { indent: 10, lineGap: 2 }));
      doc.moveDown(0.35);
    });
  }
  if (resume.projects?.length) {
    heading('Projects');
    resume.projects.forEach((item) => {
      doc.font('Helvetica-Bold').fontSize(10.5).text(item.name || 'Project');
      itemText(item.description);
      (item.bullets || []).forEach((bullet) => doc.fontSize(9.5).text(`- ${bullet}`, { indent: 10, lineGap: 2 }));
    });
  }
  if (resume.education?.length) {
    heading('Education');
    resume.education.forEach((item) => itemText([item.degree, item.institution, item.dates, item.details].filter(Boolean).join(' | ')));
  }
  if (resume.certifications?.length) {
    heading('Certifications');
    resume.certifications.forEach((item) => itemText([item.name, item.issuer, item.date].filter(Boolean).join(' | ')));
  }
  if (resume.additionalSections?.length) {
    resume.additionalSections.forEach((item) => { heading(item.title); itemText(item.content); });
  }
  doc.end();
});

const optimizeScan = async (req, res, next) => {
  try {
    const scan = await AtsScan.findOne({ _id: req.params.id, userId: req.user._id, status: 'completed' });
    if (!scan) return res.status(404).json({ success: false, message: 'ATS analysis not found' });
    if (
      scan.tailoredResume &&
      scan.optimization?.status === 'ready' &&
      scan.optimization?.version === ATS_RESUME_VERSION
    ) {
      return res.json({ success: true, cached: true, scan, optimization: scan.optimization });
    }

    const { resume, targetJob } = await loadOwnedInputs(req.user, scan.resumeId, scan.targetJobId);
    const resumeText = await extractResumeText(resume);
    const targetSnapshot = targetJobSnapshot(targetJob);
    const originalAnalysis = {
      overallScore: scan.overallScore,
      scores: scan.scores,
      matchedSkills: scan.matchedSkills,
      missingSkills: scan.missingSkills,
      matchedKeywords: scan.matchedKeywords,
      missingKeywords: scan.missingKeywords,
      strengths: scan.strengths,
      weaknesses: scan.weaknesses,
      improvements: scan.improvements
    };
    let generated = await generateTailoredResume({ resumeText, targetJob: targetSnapshot });
    let rescored = null;
    try {
      rescored = await rescoreTailoredResume({
        tailoredResume: generated.result,
        targetJob: targetSnapshot,
        originalAnalysis
      });
    } catch (error) {
      console.warn('ATS tailored resume re-score unavailable:', error.message);
    }

    if (rescored?.result?.overallScore < scan.overallScore) {
      generated = await generateTailoredResume({
        resumeText,
        targetJob: targetSnapshot,
        revisionContext: `A previous draft scored below the original. Improve alignment without inventing facts. Focus on these validated weaknesses: ${JSON.stringify(rescored.result.explanation)}. This is the only revision pass.`
      });
      try {
        rescored = await rescoreTailoredResume({
          tailoredResume: generated.result,
          targetJob: targetSnapshot,
          originalAnalysis,
          revisionContext: 'This is a revision pass. Report the truthful score even if it does not improve.'
        });
      } catch (error) {
        console.warn('ATS revised resume re-score unavailable:', error.message);
        rescored = null;
      }
    }

    const pdf = await createResumePdf(generated.result, targetJob);
    const contentHash = hashBuffer(pdf);
    await AtsArtifact.findOneAndUpdate(
      { scanId: scan._id, userId: req.user._id },
      { scanId: scan._id, userId: req.user._id, content: pdf, contentType: 'application/pdf', fileName: 'ATS-Tailored-Resume.pdf', contentHash },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    scan.tailoredResume = generated.result;
    scan.optimization = {
      status: 'ready',
      generatedAt: new Date(),
      contentHash,
      version: generated.version,
      provider: generated.provider,
      model: generated.model,
      ...projectionFromRescore(rescored, scan.overallScore),
      validation: rescored?.result?.overallScore >= scan.overallScore ? 'validated' : 'no-reliable-improvement'
    };
    await scan.save();
    return res.json({ success: true, cached: false, scan, optimization: scan.optimization });
  } catch (error) {
    return next(error);
  }
};

const sanitizeTailoredResume = (value = {}) => ({
  ...value,
  headline: String(value.headline || '').slice(0, 180),
  professionalSummary: String(value.professionalSummary || '').slice(0, 3000),
  skills: Array.isArray(value.skills) ? value.skills.map(String).slice(0, 80) : [],
  skillCategories: Array.isArray(value.skillCategories) ? value.skillCategories.slice(0, 20) : [],
  contact: value.contact || {},
  experience: Array.isArray(value.experience) ? value.experience.slice(0, 30) : [],
  education: Array.isArray(value.education) ? value.education.slice(0, 20) : [],
  projects: Array.isArray(value.projects) ? value.projects.slice(0, 30) : [],
  certifications: Array.isArray(value.certifications) ? value.certifications.slice(0, 30) : [],
  additionalSections: Array.isArray(value.additionalSections) ? value.additionalSections.slice(0, 20) : [],
  tailoringNotes: Array.isArray(value.tailoringNotes) ? value.tailoringNotes.map(String).slice(0, 40) : [],
  tailoringChanges: Array.isArray(value.tailoringChanges) ? value.tailoringChanges.slice(0, 40) : [],
  unsupportedClaimWarnings: Array.isArray(value.unsupportedClaimWarnings) ? value.unsupportedClaimWarnings.map(String).slice(0, 40) : []
});

const updateTailoredResume = async (req, res, next) => {
  try {
    const scan = await AtsScan.findOne({ _id: req.params.id, userId: req.user._id, status: 'completed' });
    if (!scan) return res.status(404).json({ success: false, message: 'ATS analysis not found' });

    const tailoredResume = sanitizeTailoredResume(req.body?.tailoredResume);
    const { targetJob } = await loadOwnedInputs(req.user, scan.resumeId, scan.targetJobId);
    const rescored = await rescoreTailoredResume({
      tailoredResume,
      targetJob: targetJobSnapshot(targetJob),
      originalAnalysis: { overallScore: scan.overallScore, scores: scan.scores }
    });
    const pdf = await createResumePdf(tailoredResume, targetJob);
    const contentHash = hashBuffer(pdf);
    await AtsArtifact.findOneAndUpdate(
      { scanId: scan._id, userId: req.user._id },
      { scanId: scan._id, userId: req.user._id, content: pdf, contentType: 'application/pdf', fileName: 'ATS-Tailored-Resume.pdf', contentHash },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    scan.tailoredResume = tailoredResume;
    scan.optimization = {
      ...(scan.optimization || {}),
      status: 'ready',
      generatedAt: new Date(),
      contentHash,
      version: ATS_RESUME_VERSION,
      ...projectionFromRescore(rescored, scan.overallScore),
      validation: rescored.result.overallScore >= scan.overallScore ? 'validated' : 'no-reliable-improvement'
    };
    await scan.save();
    return res.json({ success: true, scan, optimization: scan.optimization });
  } catch (error) {
    return next(error);
  }
};

const downloadOptimizedResume = async (req, res, next) => {
  try {
    const artifact = await AtsArtifact.findOne({ scanId: req.params.id, userId: req.user._id });
    if (!artifact) return res.status(404).json({ success: false, message: 'Generate the tailored resume before downloading it' });
    res.set({ 'Content-Type': artifact.contentType, 'Content-Disposition': `attachment; filename="${artifact.fileName}"` });
    return res.send(artifact.content);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getScans,
  getScanById,
  createScan,
  deleteScan,
  optimizeScan,
  updateTailoredResume,
  downloadOptimizedResume
};
