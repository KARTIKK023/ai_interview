const mongoose = require('mongoose');

const atsArtifactSchema = new mongoose.Schema(
  {
    scanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AtsScan',
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    content: {
      type: Buffer,
      required: true
    },
    contentType: {
      type: String,
      default: 'application/pdf'
    },
    fileName: {
      type: String,
      required: true
    },
    contentHash: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AtsArtifact', atsArtifactSchema);
