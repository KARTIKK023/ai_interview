const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      required: true
    },
    questionIndex: {
      type: Number,
      required: true
    },
    questionText: {
      type: String,
      required: true
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    answerText: {
      type: String,
      default: ''
    },
    transcript: {
      type: String,
      default: ''
    },
    audioUrl: {
      type: String,
      default: ''
    },
    videoUrl: {
      type: String,
      default: ''
    },
    score: {
      type: Number,
      default: 0
    },
    isRelevant: {
      type: Boolean,
      default: true
    },
    evaluationReason: {
      type: String,
      default: ''
    },
    criteriaScores: {
      type: Map,
      of: Number,
      default: {}
    },
    feedback: {
      type: String,
      default: ''
    },
    strengths: [{ type: String }],
    improvements: [{ type: String }],
    weaknesses: [{ type: String }]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Answer', answerSchema);
