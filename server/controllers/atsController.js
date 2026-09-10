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

const createResumePdf = (resume, targetJob) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 48,
      bufferPages: true
    });

    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // ---------------------------------------------------------
    // Page dimensions
    // ---------------------------------------------------------

    const PAGE_WIDTH = doc.page.width;
    const PAGE_HEIGHT = doc.page.height;

    const LEFT = doc.page.margins.left;
    const RIGHT = doc.page.margins.right;
    const TOP = doc.page.margins.top;
    const BOTTOM = doc.page.margins.bottom;

    const CONTENT_WIDTH = PAGE_WIDTH - LEFT - RIGHT;
    const CONTENT_BOTTOM = PAGE_HEIGHT - BOTTOM;

    // ---------------------------------------------------------
    // Colors
    // ---------------------------------------------------------

    const COLORS = {
      black: '#111111',
      dark: '#202020',
      text: '#333333',
      muted: '#666666',
      light: '#888888',
      line: '#BDBDBD'
    };

    // ---------------------------------------------------------
    // Basic helpers
    // ---------------------------------------------------------

    const safeText = (value) => {
      if (value === null || value === undefined) return '';
      return String(value).trim();
    };

    const hasText = (value) => safeText(value).length > 0;

    const availableHeight = () => CONTENT_BOTTOM - doc.y;

    const addPage = () => {
      doc.addPage({
        size: 'A4',
        margin: 48
      });
    };

    /*
     * Content-aware page break.
     *
     * This does not blindly add pages after every section.
     * It checks how much vertical space is left first.
     */
    const ensureSpace = (requiredHeight = 20) => {
      if (availableHeight() < requiredHeight) {
        addPage();
        return true;
      }

      return false;
    };

    // ---------------------------------------------------------
    // Text height helper
    // ---------------------------------------------------------

    const measureText = (text, options = {}) => {
      if (!hasText(text)) return 0;

      return doc.heightOfString(text, {
        width: options.width || CONTENT_WIDTH,
        font: options.font,
        fontSize: options.fontSize,
        lineGap: options.lineGap || 0,
        align: options.align || 'left',
        indent: options.indent || 0
      });
    };

    // ---------------------------------------------------------
    // Section heading
    // ---------------------------------------------------------

    const drawSectionHeading = (title) => {
      if (!hasText(title)) return;

      // Keep the heading with at least some content below it.
      ensureSpace(42);

      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor(COLORS.black)
        .text(title.toUpperCase(), {
          width: CONTENT_WIDTH
        });

      const lineY = doc.y + 4;

      doc
        .strokeColor(COLORS.line)
        .lineWidth(0.8)
        .moveTo(LEFT, lineY)
        .lineTo(PAGE_WIDTH - RIGHT, lineY)
        .stroke();

      doc.y = lineY + 9;
    };

    // ---------------------------------------------------------
    // Normal body text
    // ---------------------------------------------------------

    const drawBodyText = (
      text,
      {
        font = 'Helvetica',
        fontSize = 9.5,
        color = COLORS.text,
        lineGap = 2,
        width = CONTENT_WIDTH,
        align = 'left'
      } = {}
    ) => {
      if (!hasText(text)) return;

      doc
        .font(font)
        .fontSize(fontSize)
        .fillColor(color)
        .text(text, {
          width,
          lineGap,
          align
        });
    };

    // ---------------------------------------------------------
    // Bullet
    // ---------------------------------------------------------

    const drawBullet = (text) => {
      if (!hasText(text)) return;

      const bulletWidth = 12;
      const textWidth = CONTENT_WIDTH - bulletWidth;

      doc
        .font('Helvetica')
        .fontSize(9.3)
        .fillColor(COLORS.text);

      const bulletHeight = measureText(text, {
        width: textWidth,
        font: 'Helvetica',
        fontSize: 9.3,
        lineGap: 1.5
      });

      /*
       * If a bullet is very close to the bottom, move it to the
       * next page. PDFKit can split text itself, but this keeps
       * normal bullets visually clean.
       */
      if (bulletHeight <= availableHeight() && availableHeight() < 24) {
        addPage();
      }

      const startY = doc.y;

      doc
        .font('Helvetica')
        .fontSize(9.3)
        .fillColor(COLORS.text)
        .text('•', LEFT, startY, {
          width: bulletWidth
        });

      doc.text(text, LEFT + bulletWidth, startY, {
        width: textWidth,
        lineGap: 1.5
      });

      doc.y += 2;
    };

    // ---------------------------------------------------------
    // Two-column row
    // ---------------------------------------------------------

    const drawTwoColumnRow = (
      leftText,
      rightText,
      {
        leftFont = 'Helvetica',
        leftFontSize = 10,
        rightFont = 'Helvetica',
        rightFontSize = 9,
        color = COLORS.text,
        gap = 12
      } = {}
    ) => {
      if (!hasText(leftText) && !hasText(rightText)) return;

      const rightWidth = Math.min(
        150,
        Math.max(100, CONTENT_WIDTH * 0.28)
      );

      const leftWidth = CONTENT_WIDTH - rightWidth - gap;

      doc
        .font(leftFont)
        .fontSize(leftFontSize)
        .fillColor(color);

      const leftHeight = hasText(leftText)
        ? measureText(leftText, {
            width: leftWidth,
            font: leftFont,
            fontSize: leftFontSize,
            lineGap: 1
          })
        : 0;

      doc
        .font(rightFont)
        .fontSize(rightFontSize)
        .fillColor(color);

      const rightHeight = hasText(rightText)
        ? measureText(rightText, {
            width: rightWidth,
            font: rightFont,
            fontSize: rightFontSize,
            lineGap: 1
          })
        : 0;

      const rowHeight = Math.max(leftHeight, rightHeight);

      ensureSpace(rowHeight + 4);

      const startY = doc.y;

      if (hasText(leftText)) {
        doc
          .font(leftFont)
          .fontSize(leftFontSize)
          .fillColor(color)
          .text(leftText, LEFT, startY, {
            width: leftWidth,
            lineGap: 1
          });
      }

      if (hasText(rightText)) {
        doc
          .font(rightFont)
          .fontSize(rightFontSize)
          .fillColor(color)
          .text(rightText, LEFT + leftWidth + gap, startY, {
            width: rightWidth,
            align: 'right',
            lineGap: 1
          });
      }

      doc.y = startY + rowHeight;
    };

    // ---------------------------------------------------------
    // Estimate an experience/project entry height
    // ---------------------------------------------------------

    const estimateEntryHeight = ({
      title,
      rightText,
      company,
      rightSecondary,
      bullets = [],
      description
    }) => {
      let height = 0;

      const rightWidth = Math.min(
        150,
        Math.max(100, CONTENT_WIDTH * 0.28)
      );

      const leftWidth = CONTENT_WIDTH - rightWidth - 12;

      // Title
      doc.font('Helvetica-Bold').fontSize(10);

      const titleHeight = measureText(title, {
        width: leftWidth,
        font: 'Helvetica-Bold',
        fontSize: 10,
        lineGap: 1
      });

      doc.font('Helvetica').fontSize(9);

      const rightHeight = measureText(rightText, {
        width: rightWidth,
        font: 'Helvetica',
        fontSize: 9,
        lineGap: 1
      });

      height += Math.max(titleHeight, rightHeight);

      // Company / location
      if (hasText(company) || hasText(rightSecondary)) {
        doc.font('Helvetica').fontSize(9);

        const companyHeight = measureText(company, {
          width: leftWidth,
          font: 'Helvetica',
          fontSize: 9,
          lineGap: 1
        });

        const secondaryHeight = measureText(rightSecondary, {
          width: rightWidth,
          font: 'Helvetica',
          fontSize: 9,
          lineGap: 1
        });

        height += Math.max(companyHeight, secondaryHeight);
      }

      // Description
      if (hasText(description)) {
        doc.font('Helvetica').fontSize(9.3);

        height += measureText(description, {
          width: CONTENT_WIDTH,
          font: 'Helvetica',
          fontSize: 9.3,
          lineGap: 1.5
        });

        height += 2;
      }

      // Bullets
      bullets.forEach((bullet) => {
        if (!hasText(bullet)) return;

        doc.font('Helvetica').fontSize(9.3);

        height += measureText(bullet, {
          width: CONTENT_WIDTH - 12,
          font: 'Helvetica',
          fontSize: 9.3,
          lineGap: 1.5
        });

        height += 4;
      });

      return height + 7;
    };

    // ---------------------------------------------------------
    // Experience
    // ---------------------------------------------------------

    const drawExperienceItem = (item = {}) => {
      const jobTitle = safeText(item.jobTitle);
      const company = safeText(item.company);
      const location = safeText(item.location);
      const dates = safeText(item.dates);

      const bullets = Array.isArray(item.bullets)
        ? item.bullets.filter(hasText)
        : [];

      const estimatedHeight = estimateEntryHeight({
        title: jobTitle,
        rightText: dates,
        company,
        rightSecondary: location,
        bullets
      });

      /*
       * If the complete entry comfortably fits on a page but does
       * not fit in the remaining area, start it on the next page.
       *
       * If the entry itself is larger than a full page, we allow
       * PDFKit to naturally split it.
       */
      const usablePageHeight = PAGE_HEIGHT - TOP - BOTTOM;

      if (
        estimatedHeight <= usablePageHeight - 20 &&
        estimatedHeight > availableHeight()
      ) {
        addPage();
      }

      drawTwoColumnRow(jobTitle, dates, {
        leftFont: 'Helvetica-Bold',
        leftFontSize: 10,
        rightFont: 'Helvetica',
        rightFontSize: 9,
        color: COLORS.dark
      });

      if (hasText(company) || hasText(location)) {
        drawTwoColumnRow(company, location, {
          leftFont: 'Helvetica',
          leftFontSize: 9,
          rightFont: 'Helvetica',
          rightFontSize: 9,
          color: COLORS.muted
        });
      }

      bullets.forEach((bullet) => drawBullet(bullet));

      doc.y += 6;
    };

    // ---------------------------------------------------------
    // Project
    // ---------------------------------------------------------

    const drawProjectItem = (item = {}) => {
      const name = safeText(item.name || item.title);
      const dates = safeText(item.dates || item.date);
      const description = safeText(item.description);

      const bullets = Array.isArray(item.bullets)
        ? item.bullets.filter(hasText)
        : [];

      const estimatedHeight = estimateEntryHeight({
        title: name,
        rightText: dates,
        bullets,
        description
      });

      const usablePageHeight = PAGE_HEIGHT - TOP - BOTTOM;

      if (
        estimatedHeight <= usablePageHeight - 20 &&
        estimatedHeight > availableHeight()
      ) {
        addPage();
      }

      drawTwoColumnRow(name || 'Project', dates, {
        leftFont: 'Helvetica-Bold',
        leftFontSize: 10,
        rightFont: 'Helvetica',
        rightFontSize: 9,
        color: COLORS.dark
      });

      if (hasText(description)) {
        drawBodyText(description, {
          font: 'Helvetica',
          fontSize: 9.3,
          color: COLORS.text,
          lineGap: 1.5
        });

        doc.y += 2;
      }

      bullets.forEach((bullet) => drawBullet(bullet));

      doc.y += 5;
    };

    // ---------------------------------------------------------
    // Education
    // ---------------------------------------------------------

    const drawEducationItem = (item = {}) => {
      const degree = safeText(item.degree);
      const institution = safeText(item.institution);
      const dates = safeText(item.dates);
      const details = safeText(item.details);

      const title = [degree, institution]
        .filter(Boolean)
        .join(' — ');

      const estimatedHeight = estimateEntryHeight({
        title,
        rightText: dates,
        description: details
      });

      const usablePageHeight = PAGE_HEIGHT - TOP - BOTTOM;

      if (
        estimatedHeight <= usablePageHeight - 20 &&
        estimatedHeight > availableHeight()
      ) {
        addPage();
      }

      drawTwoColumnRow(title, dates, {
        leftFont: 'Helvetica-Bold',
        leftFontSize: 9.8,
        rightFont: 'Helvetica',
        rightFontSize: 9,
        color: COLORS.dark
      });

      if (hasText(details)) {
        drawBodyText(details, {
          fontSize: 9,
          color: COLORS.muted,
          lineGap: 1.5
        });
      }

      doc.y += 5;
    };

    // ---------------------------------------------------------
    // Certification
    // ---------------------------------------------------------

    const drawCertificationItem = (item = {}) => {
      const name = safeText(item.name);
      const issuer = safeText(item.issuer);
      const date = safeText(item.date);

      const left = [name, issuer]
        .filter(Boolean)
        .join(' — ');

      const estimatedHeight = estimateEntryHeight({
        title: left,
        rightText: date
      });

      const usablePageHeight = PAGE_HEIGHT - TOP - BOTTOM;

      if (
        estimatedHeight <= usablePageHeight - 20 &&
        estimatedHeight > availableHeight()
      ) {
        addPage();
      }

      drawTwoColumnRow(left, date, {
        leftFont: 'Helvetica',
        leftFontSize: 9.3,
        rightFont: 'Helvetica',
        rightFontSize: 9,
        color: COLORS.text
      });

      doc.y += 4;
    };

    // ---------------------------------------------------------
    // Skills
    // ---------------------------------------------------------

    const getAllSkills = () => {
      const skills = [];

      if (Array.isArray(resume.skills)) {
        resume.skills.forEach((skill) => {
          if (hasText(skill)) skills.push(safeText(skill));
        });
      }

      if (Array.isArray(resume.skillCategories)) {
        resume.skillCategories.forEach((category) => {
          if (!category) return;

          if (Array.isArray(category.skills)) {
            category.skills.forEach((skill) => {
              if (hasText(skill)) skills.push(safeText(skill));
            });
          }
        });
      }

      return [...new Set(skills)];
    };

    const drawSkills = () => {
      const categories = Array.isArray(resume.skillCategories)
        ? resume.skillCategories.filter(Boolean)
        : [];

      const hasCategories = categories.some(
        (category) =>
          hasText(category.category) &&
          Array.isArray(category.skills) &&
          category.skills.length
      );

      if (hasCategories) {
        const columnGap = 16;
        const columnWidth =
          (CONTENT_WIDTH - columnGap * 2) / 3;

        const rows = [];

        categories.forEach((category) => {
          const categoryName = safeText(category.category);

          const categorySkills = Array.isArray(category.skills)
            ? category.skills.filter(hasText).map(safeText)
            : [];

          if (!categoryName || !categorySkills.length) return;

          rows.push({
            title: categoryName,
            skills: categorySkills
          });
        });

        if (!rows.length) return;

        // Arrange categories into 3 columns.
        const columns = [[], [], []];

        rows.forEach((row, index) => {
          columns[index % 3].push(row);
        });

        const columnHeights = columns.map((column) => {
          return column.reduce((total, row) => {
            doc.font('Helvetica-Bold').fontSize(8.7);

            const titleHeight = measureText(row.title, {
              width: columnWidth,
              font: 'Helvetica-Bold',
              fontSize: 8.7,
              lineGap: 1
            });

            doc.font('Helvetica').fontSize(8.7);

            const skillsHeight = measureText(
              row.skills.join(', '),
              {
                width: columnWidth,
                font: 'Helvetica',
                fontSize: 8.7,
                lineGap: 1.5
              }
            );

            return total + titleHeight + skillsHeight + 8;
          }, 0);
        });

        const requiredHeight = Math.max(...columnHeights);

        ensureSpace(requiredHeight + 4);

        const startY = doc.y;

        columns.forEach((column, columnIndex) => {
          let columnY = startY;

          column.forEach((row) => {
            doc
              .font('Helvetica-Bold')
              .fontSize(8.7)
              .fillColor(COLORS.dark)
              .text(row.title, LEFT + columnIndex * (columnWidth + columnGap), columnY, {
                width: columnWidth,
                lineGap: 1
              });

            columnY = doc.y + 1;

            doc
              .font('Helvetica')
              .fontSize(8.7)
              .fillColor(COLORS.text)
              .text(
                row.skills.join(', '),
                LEFT + columnIndex * (columnWidth + columnGap),
                columnY,
                {
                  width: columnWidth,
                  lineGap: 1.5
                }
              );

            columnY = doc.y + 6;
          });
        });

        doc.y = startY + requiredHeight;

        return;
      }

      // Fallback for a flat skills array.
      const skills = getAllSkills();

      if (!skills.length) return;

      const columnCount = 3;
      const columnGap = 16;

      const columnWidth =
        (CONTENT_WIDTH - columnGap * 2) / columnCount;

      const columns = [[], [], []];

      skills.forEach((skill, index) => {
        columns[index % columnCount].push(skill);
      });

      const columnHeights = columns.map((column) => {
        return column.reduce((total, skill) => {
          doc.font('Helvetica').fontSize(8.8);

          return (
            total +
            measureText(`• ${skill}`, {
              width: columnWidth,
              font: 'Helvetica',
              fontSize: 8.8,
              lineGap: 1.5
            }) +
            3
          );
        }, 0);
      });

      const requiredHeight = Math.max(...columnHeights);

      ensureSpace(requiredHeight + 4);

      const startY = doc.y;

      columns.forEach((column, columnIndex) => {
        let columnY = startY;

        column.forEach((skill) => {
          doc
            .font('Helvetica')
            .fontSize(8.8)
            .fillColor(COLORS.text)
            .text(
              `• ${skill}`,
              LEFT + columnIndex * (columnWidth + columnGap),
              columnY,
              {
                width: columnWidth,
                lineGap: 1.5
              }
            );

          columnY = doc.y + 3;
        });
      });

      doc.y = startY + requiredHeight;
    };

    // =========================================================
    // HEADER
    // =========================================================

    const contact = resume.contact || {};

    const name =
      safeText(contact.name) ||
      safeText(resume.headline) ||
      safeText(targetJob?.target_job_role) ||
      'Targeted Resume';

    const headline = safeText(resume.headline);

    const contactItems = [
      contact.email,
      contact.phone,
      contact.location,
      ...(Array.isArray(contact.links) ? contact.links : [])
    ]
      .filter(hasText)
      .map(safeText);

    const targetRole = safeText(targetJob?.target_job_role);
    const targetCompany = safeText(targetJob?.target_company);

    // Name
    doc
      .font('Helvetica-Bold')
      .fontSize(21)
      .fillColor(COLORS.black)
      .text(name, {
        width: CONTENT_WIDTH,
        align: 'center'
      });

    // Headline
    if (headline && headline !== name) {
      doc.moveDown(0.15);

      doc
        .font('Helvetica')
        .fontSize(10.5)
        .fillColor(COLORS.muted)
        .text(headline, {
          width: CONTENT_WIDTH,
          align: 'center'
        });
    }

    // Contact row
    if (contactItems.length) {
      doc.moveDown(0.2);

      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor(COLORS.muted)
        .text(contactItems.join('  |  '), {
          width: CONTENT_WIDTH,
          align: 'center',
          lineGap: 1
        });
    }

    // Target role
    if (targetRole) {
      doc.moveDown(0.2);

      const tailoredFor = [
        `Tailored for ${targetRole}`,
        targetCompany ? `at ${targetCompany}` : ''
      ]
        .filter(Boolean)
        .join(' ');

      doc
        .font('Helvetica')
        .fontSize(8.2)
        .fillColor(COLORS.light)
        .text(tailoredFor, {
          width: CONTENT_WIDTH,
          align: 'center'
        });
    }

    doc.moveDown(0.6);

    // =========================================================
    // PROFESSIONAL SUMMARY
    // =========================================================

    if (hasText(resume.professionalSummary)) {
      drawSectionHeading('Professional Summary');

      drawBodyText(resume.professionalSummary, {
        fontSize: 9.4,
        color: COLORS.text,
        lineGap: 2
      });

      doc.y += 5;
    }

    // =========================================================
    // TECHNICAL SKILLS
    // =========================================================

    if (
      (Array.isArray(resume.skills) && resume.skills.length) ||
      (Array.isArray(resume.skillCategories) &&
        resume.skillCategories.length)
    ) {
      drawSectionHeading('Technical Skills');

      drawSkills();

      doc.y += 6;
    }

    // =========================================================
    // EXPERIENCE
    // =========================================================

    if (
      Array.isArray(resume.experience) &&
      resume.experience.length
    ) {
      drawSectionHeading('Experience');

      resume.experience.forEach((item) => {
        drawExperienceItem(item);
      });
    }

    // =========================================================
    // PROJECTS
    // =========================================================

    if (
      Array.isArray(resume.projects) &&
      resume.projects.length
    ) {
      drawSectionHeading('Projects');

      resume.projects.forEach((item) => {
        drawProjectItem(item);
      });
    }

    // =========================================================
    // EDUCATION
    // =========================================================

    if (
      Array.isArray(resume.education) &&
      resume.education.length
    ) {
      drawSectionHeading('Education');

      resume.education.forEach((item) => {
        drawEducationItem(item);
      });
    }

    // =========================================================
    // CERTIFICATIONS
    // =========================================================

    if (
      Array.isArray(resume.certifications) &&
      resume.certifications.length
    ) {
      drawSectionHeading('Certifications');

      resume.certifications.forEach((item) => {
        drawCertificationItem(item);
      });
    }

    // =========================================================
    // ADDITIONAL SECTIONS
    // =========================================================

    if (
      Array.isArray(resume.additionalSections) &&
      resume.additionalSections.length
    ) {
      resume.additionalSections.forEach((item) => {
        if (!item) return;

        const title = safeText(item.title);
        const content = safeText(item.content);

        if (!title || !content) return;

        drawSectionHeading(title);

        drawBodyText(content, {
          fontSize: 9.3,
          color: COLORS.text,
          lineGap: 2
        });

        doc.y += 6;
      });
    }

    // ---------------------------------------------------------
    // Finish PDF
    // ---------------------------------------------------------

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
