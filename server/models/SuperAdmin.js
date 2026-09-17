const mongoose = require('mongoose');

const superAdminSchema = new mongoose.Schema(
  {
    adminId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    username: {
      type: String,
      sparse: true,
      trim: true,
      lowercase: true
    },
    fullName: {
      type: String,
      trim: true
    },
    name: {
      type: String,
      trim: true
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
      enum: ['SUPER_ADMIN'],
      default: 'SUPER_ADMIN'
    },
    permissions: [
      {
        type: String
      }
    ],
    emailVerified: {
      type: Boolean,
      default: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    profilePhoto: {
      type: String,
      default: ''
    },
    serviceStatus: {
      type: String,
      enum: ['Active', 'Services Inactive', 'ACTIVE', 'SERVICES_INACTIVE', 'Inactive'],
      default: 'Active'
    },
    lastLogin: {
      type: Date,
      default: null
    },
    loginStartedAt: {
      type: Date,
      default: null
    },
    lastLogout: {
      type: Date,
      default: null
    },
    loginDuration: {
      type: Number,
      default: 0
    },
    isOnline: {
      type: Boolean,
      default: false
    },
    loginHistory: [
      {
        loginAt: { type: Date, required: true },
        logoutAt: { type: Date, default: null },
        duration: { type: Number, default: 0 }
      }
    ]
  },
  { timestamps: true }
);

superAdminSchema.pre('save', function (next) {
  if (this.fullName && !this.name) this.name = this.fullName;
  if (this.name && !this.fullName) this.fullName = this.name;
  next();
});

module.exports = mongoose.model('SuperAdmin', superAdminSchema, 'superadmins');
