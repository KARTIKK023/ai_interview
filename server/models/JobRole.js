const mongoose = require('mongoose');

const jobRoleSchema = new mongoose.Schema(
  {
    roleName: {
      type: String,
      trim: true
    },
    name: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    isPredefined: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    description: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Ensure both roleName and name are populated on save
jobRoleSchema.pre('save', function (next) {
  if (this.roleName && !this.name) {
    this.name = this.roleName;
  } else if (this.name && !this.roleName) {
    this.roleName = this.name;
  }
  next();
});

module.exports = mongoose.model('JobRole', jobRoleSchema);

