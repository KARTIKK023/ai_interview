const mongoose = require('mongoose');

const supportMessageSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    studentName: {
      type: String,
      required: true,
      trim: true,
    },

    studentEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    status: {
      type: String,
      enum: [
        'Pending',
        'In Progress',
        'Resolved',
      ],
      default: 'Pending',
    },

    emailStatus: {
      type: String,
      enum: [
        'Pending',
        'Sent',
        'Failed',
      ],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  'SupportMessage',
  supportMessageSchema
);