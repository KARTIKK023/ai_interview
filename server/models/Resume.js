const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    studentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    student_id: {
      type: String,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    student_name: {
      type: String,
      trim: true
    },
    fileName: {
      type: String,
      required: true
    },
    contentType: {
      type: String,
      default: 'application/pdf'
    },
    fileData: {
      type: Buffer,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    resume_file: {
      fileName: String,
      contentType: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Resume', resumeSchema);
