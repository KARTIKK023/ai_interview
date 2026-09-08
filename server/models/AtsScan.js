const mongoose = require('mongoose');

const atsScanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
      index: true
    },
    targetJobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TargetJob',
      required: true,
      index: true
    },
    targetJob: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    resumeHash: {
      type: String,
      required: true,
      index: true
    },
    targetJobHash: {
      type: String,
      required: true,
      index: true
    },
    analysisVersion: {
      type: String,
      required: true,
      index: true
    },
    provider: { type: String, default: '' },
    model: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
      index: true
    },
    failureMessage: { type: String, default: '' },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    scores: {
      atsCompatibility: { type: Number, default: 0 },
      keywordMatch: { type: Number, default: 0 },
      skillsMatch: { type: Number, default: 0 },
      experience: { type: Number, default: 0 },
      education: { type: Number, default: 0 },
      formatting: { type: Number, default: 0 }
    },
    matchedSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    matchedKeywords: { type: [String], default: [] },
    missingKeywords: { type: [String], default: [] },
    criticalKeywords: { type: [String], default: [] },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    improvements: { type: [mongoose.Schema.Types.Mixed], default: [] },
    scoreRationales: { type: [mongoose.Schema.Types.Mixed], default: [] },
    evidence: { type: [mongoose.Schema.Types.Mixed], default: [] },
    recruiterSummary: { type: String, default: '' },
    unsupportedClaimWarnings: { type: [String], default: [] },
    analysis: { type: mongoose.Schema.Types.Mixed, default: null },
    optimization: { type: mongoose.Schema.Types.Mixed, default: null },
    tailoredResume: { type: mongoose.Schema.Types.Mixed, default: null }
  },
  { timestamps: true }
);

atsScanSchema.index(
  { userId: 1, resumeHash: 1, targetJobHash: 1, analysisVersion: 1 },
  { unique: true, partialFilterExpression: { status: 'completed' } }
);

module.exports = mongoose.model('AtsScan', atsScanSchema);
