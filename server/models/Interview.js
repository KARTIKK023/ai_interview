const mongoose = require('mongoose');
require('./JobRole');
require('./User');
require('./TargetJob');

const interviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobRole',
      default: null
    },
    targetJobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TargetJob',
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    category: {
      type: String,
      enum: ['Technical', 'Non-Technical'],
      required: true
    },
    jobRole: {
      type: String,
      required: true
    },
    purpose: {
      type: String,
      enum: ['Practice', 'Recruitment'],
      default: 'Practice'
    },
    mode: {
      type: String,
      enum: ['Text', 'Video'],
      default: 'Text'
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate'
    },
    targetJobSnapshot: {
      target_job_role: { type: String, default: '' },
      target_company: { type: String, default: '' },
      target_industry: { type: String, default: '' },
      experience: { type: String, default: 'Fresher' },
      preferred_location: { type: String, default: '' },
      job_type: { type: String, default: 'Full Time' },
      expected_salary: { type: String, default: '' },
      required_skills: [{ type: String }],
      job_description: { type: String, default: '' }
    },
    questions: [
      {
        questionText: { type: String, required: true },
        questionType: { type: String, default: 'General' },
        difficulty: { type: String, default: 'Intermediate' },
        evaluationCriteria: [{ type: String }],
        expectedCompetencies: [{ type: String }],
        followUpTo: { type: String, default: null }
      }
    ],
    duration: {
      type: Number,
      default: 30 // in minutes
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed', 'Stopped', 'Expired'],
      default: 'Pending'
    },
    score: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    },
    student_id: {
      type: String,
      default: ''
    },
    total_questions: {
      type: Number,
      default: 0
    },
    answered_questions: {
      type: Number,
      default: 0
    },
    evaluation: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    startedAt: {
      type: Date
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Interview', interviewSchema);
