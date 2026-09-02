const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
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
    mobileNumber: {
      type: String,
      trim: true
    },
    role: {
      type: String,
      enum: ['student', 'admin', 'hr', 'super_admin', 'STUDENT', 'ADMIN', 'HR', 'SUPER_ADMIN'],
      default: 'student'
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    profilePhoto: { type: String, default: '' },
    dateOfBirth: { type: String, default: '' },
    gender: { type: String, default: '' },
    location: { type: String, default: '' },
    bio: { type: String, default: '' },
    education: {
      highestQualification: { type: String, default: '' },
      collegeUniversity: { type: String, default: '' },
      degree: { type: String, default: '' },
      specialization: { type: String, default: '' },
      graduationYear: { type: String, default: '' },
      cgpaPercentage: { type: String, default: '' }
    },
    professionalLinks: {
      linkedin: { type: String, default: '' },
      portfolio: { type: String, default: '' },
      other: { type: String, default: '' }
    },
    profile: {
      phone: { type: String, default: '' },
      bio: { type: String, default: '' },
      companyName: { type: String, default: '' },
      profilePhoto: { type: String, default: '' },
      dateOfBirth: { type: String, default: '' },
      gender: { type: String, default: '' },
      location: { type: String, default: '' },
      education: {
        highestQualification: { type: String, default: '' },
        collegeUniversity: { type: String, default: '' },
        degree: { type: String, default: '' },
        specialization: { type: String, default: '' },
        graduationYear: { type: String, default: '' },
        cgpaPercentage: { type: String, default: '' }
      },
      professionalLinks: {
        linkedin: { type: String, default: '' },
        portfolio: { type: String, default: '' },
        other: { type: String, default: '' }
      },
      targetRoles: [{ type: String }],
      skills: [{ type: String }]
    },
    isActive: {
      type: Boolean,
      default: true
    },
    serviceStatus: {
      type: String,
      enum: ['Active', 'Services Inactive', 'ACTIVE', 'SERVICES_INACTIVE', 'Inactive'],
      default: 'Active'
    }
  },
  {
    timestamps: true
  }
);

// Pre-save middleware to keep name/fullName and mobileNumber/profile.phone in sync for backward compatibility
userSchema.pre('save', function (next) {
  if (this.fullName && !this.name) {
    this.name = this.fullName;
  } else if (this.name && !this.fullName) {
    this.fullName = this.name;
  }

  if (this.mobileNumber && (!this.profile || !this.profile.phone)) {
    this.profile = this.profile || {};
    this.profile.phone = this.mobileNumber;
  } else if (this.profile && this.profile.phone && !this.mobileNumber) {
    this.mobileNumber = this.profile.phone;
  }

  next();
});

module.exports = mongoose.model('User', userSchema);
