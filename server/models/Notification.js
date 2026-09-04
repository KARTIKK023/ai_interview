const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    // Super Admin who sent the notification
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Notification title / email subject
    subject: {
      type: String,
      required: true,
      trim: true
    },

    // Notification message
    message: {
      type: String,
      required: true,
      trim: true
    },

    // Selected students who received the notification
    recipients: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },

        name: {
          type: String,
          trim: true
        },

        email: {
          type: String,
          required: true,
          lowercase: true,
          trim: true
        },

        // Email delivery status
        status: {
          type: String,
          enum: ['pending', 'sent', 'failed'],
          default: 'pending'
        },

        // Error if sending failed
        error: {
          type: String,
          default: null
        },

        // When the email was successfully sent
        sentAt: {
          type: Date,
          default: null
        }
      }
    ],

    // Overall notification status
    status: {
      type: String,
      enum: ['processing', 'completed', 'partial', 'failed'],
      default: 'processing'
    },

    // Statistics
    totalRecipients: {
      type: Number,
      default: 0
    },

    successfulCount: {
      type: Number,
      default: 0
    },

    failedCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);


// Index for notification history

notificationSchema.index({
  createdAt: -1
});


module.exports = mongoose.model(
  'Notification',
  notificationSchema
);