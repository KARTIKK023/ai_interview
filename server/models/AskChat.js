const mongoose = require('mongoose');

const askChatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    title: {
      type: String,
      trim: true,
      default: 'New Chat',
      maxlength: 120,
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

askChatSchema.index({
  user: 1,
  lastMessageAt: -1,
});

module.exports = mongoose.model('AskChat', askChatSchema);