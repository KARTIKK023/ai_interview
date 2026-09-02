const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['Technical', 'Non-Technical'],
      required: true
    },
    jobRole: {
      type: String,
      required: true
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate'
    },
    type: {
      type: String,
      enum: ['Text', 'Video'],
      default: 'Text'
    },
    source: {
      type: String,
      enum: ['System', 'AI', 'HR'],
      default: 'System'
    },
    evaluationCriteria: [{
      type: String
    }],
    skill: {
      type: String,
      trim: true
    },
    company: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Question', questionSchema);
