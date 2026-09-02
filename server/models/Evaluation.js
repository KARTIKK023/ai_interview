const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      required: true,
      unique: true
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    overallScore: {
      type: Number,
      default: 0
    },
    roleSpecificScores: {
      type: Map,
      of: Number,
      default: {}
    },
    strengths: [{
      type: String
    }],
    weaknesses: [{
      type: String
    }],
    recommendations: [{
      type: String
    }],
    summary: {
      type: String,
      default: ''
    },
    aiRecommendation: {
      type: String,
      enum: ['Strong Candidate', 'Needs Review', 'Weak Candidate', 'Completed Practice'],
      default: 'Needs Review'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Evaluation', evaluationSchema);
