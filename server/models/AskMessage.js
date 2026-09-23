const mongoose = require('mongoose');

const askMessageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AskChat',
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    model: {
      type: String,
      default: 'llama-3.1-8b-instant',
    },

    completed: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

askMessageSchema.index({
  chat: 1,
  createdAt: 1,
});

module.exports = mongoose.model('AskMessage', askMessageSchema);