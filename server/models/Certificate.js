const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    studentUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    studentId: {
      type: String,
      default: ''
    },
    studentName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      default: ''
    },
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview'
    },
    jobRole: {
      type: String,
      required: true,
      default: 'Software Engineer'
    },
    category: {
      type: String,
      default: 'Technical'
    },
    mode: {
      type: String,
      default: 'Video'
    },
    score: {
      type: Number,
      required: true,
      default: 85
    },
    title: {
      type: String,
      required: true
    },
    organization: {
      type: String,
      default: 'Web Ai Tech Solution LLP'
    },
    status: {
      type: String,
      default: 'Verified'
    },
    issuedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Certificate', certificateSchema);
