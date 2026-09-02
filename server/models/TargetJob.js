const mongoose = require('mongoose');

const targetJobSchema = new mongoose.Schema(
  {
    student_id: {
      type: String,
      required: true,
      index: true
    },
    target_job_role: {
      type: String,
      required: [true, 'Please select or enter a target job role'],
      trim: true
    },
    target_industry: {
      type: String,
      default: '',
      trim: true
    },
    target_company: {
      type: String,
      default: '',
      trim: true
    },
    experience: {
      type: String,
      default: 'Fresher',
      trim: true
    },
    required_skills: [
      {
        type: String,
        trim: true
      }
    ],
    preferred_location: {
      type: String,
      default: '',
      trim: true
    },
    job_type: {
      type: String,
      default: 'Full Time',
      trim: true
    },
    expected_salary: {
      type: String,
      default: '',
      trim: true
    },
    job_description: {
      type: String,
      default: '',
      trim: true
    },
    job_url: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('TargetJob', targetJobSchema);
