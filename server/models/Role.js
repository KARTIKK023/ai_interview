const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    adminId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    username: {
      type: String,
      required: [true, 'Please add a username'],
      unique: true,
      trim: true,
      lowercase: true
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ['admin', 'ADMIN', 'super_admin', 'SUPER_ADMIN'],
      default: 'admin'
    },
    permissions: [
      {
        type: String
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Map explicitly to the 'roles' collection in MongoDB
module.exports = mongoose.model('Role', roleSchema, 'roles');
