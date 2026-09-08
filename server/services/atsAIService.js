const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
const { generateWithRetry } = require('./aiRetryService');

const ATS_ANALYSIS_VERSION = 'ats-v2';
const ATS_RESUME_VERSION = 'resume-v3';
const MAX_RESUME_TEXT = 30000;

const provider = (process.env.ATS_AI_PROVIDER || process.env.AI_PROVIDER || 'gemini').toLowerCase();
const geminiModelName = process.env.ATS_GEMINI_MODEL || 'gemini-2.5-flash-lite';
const groqModelName = process.env.ATS_GROQ_MODEL || process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

const trimResumeText = (text) => String(text || '').replace(/\s+/g, ' ').trim().slice(0, MAX_RESUME_TEXT);

const cleanJson = (value) => {
  const text = String(value || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const start = Math.min(...[text.indexOf('{'), text.indexOf('[')].filter((index) => index >= 0));
  const end = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));
  if (start === Infinity || end < start) throw new Error('ATS AI returned invalid JSON');
  return JSON.parse(text.slice(start, end + 1));
};

const getGeminiText = async (prompt) => {
  const apiKey = process.env.ATS_GEMINI_API_KEY || process.env.AI_API_KEY;
  if (!apiKey) throw new Error('ATS Gemini API key is missing');
  const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: geminiModelName });
  const result = await model.generateContent(prompt);
  return result.response.text();
};

const getGroqText = async (prompt) => {
  const apiKey = process.env.ATS_GROQ_API_KEY || process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('ATS Groq API key is missing');
  const groq = new Groq({ apiKey });
  return generateWithRetry(async () => {
    const result = await groq.chat.completions.create({
      model: groqModelName,
      temperature: 0.2,
      max_tokens: 6000,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }]
    });
    return result.choices?.[0]?.message?.content || '';
  });
};

const generateJson = async (prompt) => {
  if (provider === 'gemini') return cleanJson(await getGeminiText(prompt));
  if (provider === 'groq') return cleanJson(await getGroqText(prompt));
  throw new Error(`Unsupported ATS AI provider: ${provider}. Use gemini or groq.`);
};

const clampScore = (value) => Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
const stringArray = (value) => (Array.isArray(value) ? value : []).map((item) => String(item || '').trim()).filter(Boolean).slice(0, 40);
const objectArray = (value, fields) => (Array.isArray(value) ? value : []).slice(0, 30).map((item) => {
  if (typeof item === 'string') return { text: item };
  return fields.reduce((result, field) => ({ ...result, [field]: String(item?.[field] || '').trim() }), {});
});

const normalizeAnalysis = (result) => {
  const scores = result?.scores || {};
  return {
    overallScore: clampScore(result?.overallScore),
    scores: {
      atsCompatibility: clampScore(scores.atsCompatibility),
      keywordMatch: clampScore(scores.keywordMatch),
      skillsMatch: clampScore(scores.skillsMatch),
      experience: clampScore(scores.experience),
      education: clampScore(scores.education),
      formatting: clampScore(scores.formatting)
    },
    scoreRationales: objectArray(result?.scoreRationales, ['category', 'score', 'reason', 'evidence']),
    matchedSkills: stringArray(result?.matchedSkills),
    missingSkills: stringArray(result?.missingSkills),
    matchedKeywords: stringArray(result?.matchedKeywords),
    missingKeywords: stringArray(result?.missingKeywords),
    criticalKeywords: stringArray(result?.criticalKeywords),
    strengths: stringArray(result?.strengths),
    weaknesses: stringArray(result?.weaknesses),
    improvements: objectArray(result?.improvements, ['priority', 'title', 'description', 'action']),
    evidence: objectArray(result?.evidence, ['category', 'quote', 'interpretation']),
    recruiterSummary: String(result?.recruiterSummary || '').trim(),
    unsupportedClaimWarnings: stringArray(result?.unsupportedClaimWarnings)
  };
};

const normalizeResume = (result) => {
  const section = (value) => (Array.isArray(value) ? value : []).map((item) => {
    if (typeof item === 'string') return { text: item };
    return item;
  }).slice(0, 40);
  return {
    headline: String(result?.headline || '').trim(),
    professionalSummary: String(result?.professionalSummary || '').trim(),
    skills: stringArray(result?.skills),
    skillCategories: (Array.isArray(result?.skillCategories) ? result.skillCategories : []).map((item) => ({
      category: String(item?.category || '').trim(),
      skills: stringArray(item?.skills)
    })).filter((item) => item.category && item.skills.length),
    contact: {
      name: String(result?.contact?.name || '').trim(),
      email: String(result?.contact?.email || '').trim(),
      phone: String(result?.contact?.phone || '').trim(),
      location: String(result?.contact?.location || '').trim(),
      links: stringArray(result?.contact?.links)
    },
    experience: section(result?.experience),
    education: section(result?.education),
    projects: section(result?.projects),
    certifications: section(result?.certifications),
    additionalSections: section(result?.additionalSections),
    tailoringNotes: stringArray(result?.tailoringNotes),
    tailoringChanges: (Array.isArray(result?.tailoringChanges) ? result.tailoringChanges : []).map((item) => ({
      section: String(item?.section || '').trim(),
      change: String(item?.change || '').trim(),
      reason: String(item?.reason || '').trim(),
      supportedBy: String(item?.supportedBy || '').trim()
    })).filter((item) => item.section && item.change),
    projectedScore: result?.projectedScore == null ? null : clampScore(result.projectedScore),
    projectedScores: result?.projectedScores ? Object.fromEntries(Object.entries(result.projectedScores).map(([key, value]) => [key, value == null ? null : clampScore(value)])) : null,
    projectionExplanation: (Array.isArray(result?.projectionExplanation) ? result.projectionExplanation : []).map((item) => ({
      category: String(item?.category || '').trim(),
      reason: String(item?.reason || '').trim(),
      scoreBefore: item?.scoreBefore == null ? null : clampScore(item.scoreBefore),
      scoreAfter: item?.scoreAfter == null ? null : clampScore(item.scoreAfter)
    })).filter((item) => item.category && item.reason),
    projectionConfidence: ['high', 'medium', 'low'].includes(result?.projectionConfidence) ? result.projectionConfidence : null,
    unsupportedClaimWarnings: stringArray(result?.unsupportedClaimWarnings)
  };
};

const normalizeRescore = (result) => {
  const rawScores = result?.scores || {};
  const categories = ['atsCompatibility', 'keywordMatch', 'skillsMatch', 'experience', 'education', 'formatting'];
  const scores = {};

  for (const category of categories) {
    const value = Number(rawScores[category]);
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      throw new Error(`ATS re-score returned an invalid ${category} score`);
    }
    scores[category] = Math.round(value);
  }

  const overallScore = Number(result?.overallScore);
  if (!Number.isFinite(overallScore) || overallScore < 0 || overallScore > 100) {
    throw new Error('ATS re-score did not return a valid overall score');
  }

  return {
    overallScore: Math.round(overallScore),
    scores,
    explanation: objectArray(result?.explanation, ['category', 'reason', 'scoreBefore', 'scoreAfter'])
  };
};

const analysisPrompt = ({ resumeText, targetJob }) => `You are an expert ATS resume evaluator and recruiter. Analyze the candidate resume against the target job. Return JSON only, with no markdown.

Rules:
- Evaluate only information present in the resume text and target job.
- Never invent experience, employers, dates, degrees, skills, metrics, or certifications.
- Score every score from 0 to 100.
- Explain each score with evidence from the resume. Evidence must be a short exact or near-exact resume phrase.
- Be specific and actionable.

Required JSON shape:
{
  "overallScore": number,
  "scores": { "atsCompatibility": number, "keywordMatch": number, "skillsMatch": number, "experience": number, "education": number, "formatting": number },
  "scoreRationales": [{ "category": string, "score": number, "reason": string, "evidence": string }],
  "matchedSkills": [string], "missingSkills": [string], "matchedKeywords": [string], "missingKeywords": [string], "criticalKeywords": [string],
  "strengths": [string], "weaknesses": [string],
  "improvements": [{ "priority": "high"|"medium"|"low", "title": string, "description": string, "action": string }],
  "evidence": [{ "category": string, "quote": string, "interpretation": string }],
  "recruiterSummary": string,
  "unsupportedClaimWarnings": [string]
}

TARGET JOB:\n${JSON.stringify(targetJob)}\n\nRESUME TEXT:\n${trimResumeText(resumeText)}`;

const resumePrompt = ({ resumeText, targetJob, revisionContext = '' }) => `You are an expert resume writer and ATS evaluator. Create an ATS-friendly, target-job-tailored resume from the source resume and target job. Return JSON only, with no markdown.

Rules:
- Preserve only facts supported by the source resume.
- Do not invent employers, dates, degrees, technologies, achievements, metrics, or certifications.
- You may reorder, shorten, and rewrite supported facts for clarity and keyword alignment.
- Rewrite only when the source supports the responsibility or technology. Never add a job-description keyword just because it appears in the target job.
- Estimate a projected ATS score using the same six categories as the original analysis. This is a cautious prediction, not a guarantee. If the source does not support a category-level estimate, return null for that category and use null for the overall projection.
- Explain every projected improvement using actual changes made and supported source evidence. Do not invent point values merely to make the result look better.
- Use empty arrays or empty strings when information is not available.
- Include warnings for anything the candidate should verify before using.
${revisionContext}

Required JSON shape:
{
  "contact": { "name": string, "email": string, "phone": string, "location": string, "links": [string] },
  "headline": string,
  "professionalSummary": string,
  "skills": [string],
  "skillCategories": [{ "category": string, "skills": [string] }],
  "experience": [{ "jobTitle": string, "company": string, "location": string, "dates": string, "bullets": [string] }],
  "education": [{ "degree": string, "institution": string, "dates": string, "details": string }],
  "projects": [{ "name": string, "dates": string, "description": string, "bullets": [string], "technologies": [string] }],
  "certifications": [{ "name": string, "issuer": string, "date": string }],
  "additionalSections": [{ "title": string, "content": string }],
  "tailoringNotes": [string],
  "tailoringChanges": [{ "section": string, "change": string, "reason": string, "supportedBy": string }],
  "projectedScore": number|null,
  "projectedScores": { "atsCompatibility": number|null, "keywordMatch": number|null, "skillsMatch": number|null, "experience": number|null, "education": number|null, "formatting": number|null }|null,
  "projectionExplanation": [{ "category": string, "reason": string, "scoreBefore": number|null, "scoreAfter": number|null }],
  "projectionConfidence": "high"|"medium"|"low"|null,
  "unsupportedClaimWarnings": [string]
}

TARGET JOB:\n${JSON.stringify(targetJob)}\n\nSOURCE RESUME TEXT:\n${trimResumeText(resumeText)}`;

const rescorePrompt = ({ tailoredResume, targetJob, originalAnalysis, revisionContext = '' }) => `You are an ATS evaluator. Re-score this structured tailored resume against the target job using the same six dimensions as the original analysis. Return JSON only, with no markdown.

Rules:
- Score only what is supported by the tailored resume and original analysis.
- Do not award points for unsupported technologies, employers, dates, metrics, or claims.
- Scores must be whole numbers from 0 to 100.
- The overall score must be your reasoned assessment, not a desired marketing result.
- Explain meaningful differences without inventing point contributions.
${revisionContext}

Required JSON shape:
{
  "overallScore": number,
  "scores": { "atsCompatibility": number, "keywordMatch": number, "skillsMatch": number, "experience": number, "education": number, "formatting": number },
  "explanation": [{ "category": string, "reason": string, "scoreBefore": number, "scoreAfter": number }]
}

ORIGINAL ANALYSIS:\n${JSON.stringify(originalAnalysis)}\n\nTARGET JOB:\n${JSON.stringify(targetJob)}\n\nTAILORED RESUME:\n${JSON.stringify(tailoredResume)}`;

const analyzeResume = async ({ resumeText, targetJob }) => ({
  result: normalizeAnalysis(await generateJson(analysisPrompt({ resumeText, targetJob }))),
  provider,
  model: provider === 'gemini' ? geminiModelName : groqModelName,
  version: ATS_ANALYSIS_VERSION
});

const generateTailoredResume = async ({ resumeText, targetJob, revisionContext }) => ({
  result: normalizeResume(await generateJson(resumePrompt({ resumeText, targetJob, revisionContext }))),
  provider,
  model: provider === 'gemini' ? geminiModelName : groqModelName,
  version: ATS_RESUME_VERSION
});

const rescoreTailoredResume = async ({ tailoredResume, targetJob, originalAnalysis, revisionContext }) => ({
  result: normalizeRescore(await generateJson(rescorePrompt({ tailoredResume, targetJob, originalAnalysis, revisionContext }))),
  provider,
  model: provider === 'gemini' ? geminiModelName : groqModelName
});

module.exports = {
  ATS_ANALYSIS_VERSION,
  ATS_RESUME_VERSION,
  MAX_RESUME_TEXT,
  analyzeResume,
  generateTailoredResume,
  rescoreTailoredResume,
  trimResumeText
};
