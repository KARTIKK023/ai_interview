import API from '../../../services/api';

export const atsApi = {
  getResume: () => API.get('/resume/my-resume'),
  getTargetJobs: () => API.get('/target-jobs'),
  getScans: (params) => API.get('/ats/scans', { params }),
  getScan: (id) => API.get(`/ats/scans/${id}`),
  createScan: (payload) => API.post('/ats/scan', payload),
  deleteScan: (id) => API.delete(`/ats/scans/${id}`),
  optimize: (id) => API.post(`/ats/scans/${id}/optimize`),
  updateTailoredResume: (id, tailoredResume) => API.put(`/ats/scans/${id}/tailored-resume`, { tailoredResume }),
  downloadOptimized: (id) => API.get(`/ats/scans/${id}/optimized-resume`, { responseType: 'blob' }),
  downloadOriginal: (id) => API.get(`/resume/file/${id}`, { responseType: 'blob' })
};

export const normalizeScan = (scan = {}) => ({
  ...scan,
  overallScore: Number(scan.overallScore ?? scan.score ?? 0),
  scores: {
    atsCompatibility: Number(scan.scores?.atsCompatibility ?? scan.atsCompatibilityScore ?? 0),
    keywordMatch: Number(scan.scores?.keywordMatch ?? scan.keywordMatchScore ?? 0),
    skillsMatch: Number(scan.scores?.skillsMatch ?? scan.skillsMatchScore ?? 0),
    experience: Number(scan.scores?.experience ?? scan.experienceScore ?? 0),
    education: Number(scan.scores?.education ?? scan.educationScore ?? 0),
    formatting: Number(scan.scores?.formatting ?? scan.formattingScore ?? 0)
  },
  matchedSkills: scan.matchedSkills || [],
  missingSkills: scan.missingSkills || [],
  matchedKeywords: scan.matchedKeywords || [],
  missingKeywords: scan.missingKeywords || [],
  strengths: scan.strengths || [],
  weaknesses: scan.weaknesses || [],
  improvements: scan.improvements || [],
  scoreRationales: scan.scoreRationales || [],
  evidence: scan.evidence || [],
  unsupportedClaimWarnings: scan.unsupportedClaimWarnings || [],
  tailoredResume: scan.tailoredResume || null,
  optimization: scan.optimization || null
});

export const errorMessage = (error, fallback) => error?.response?.data?.message || fallback;
