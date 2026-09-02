const Question = require('../models/Question');
const { generateInterviewQuestions } = require('../services/aiService');

// @desc    Get questions with filters
// @route   GET /api/questions
// @access  Private / Public
const getQuestions = async (req, res, next) => {
  try {
    const { category, jobRole, difficulty, skill, company } = req.query;
    const query = {};
    if (category) query.category = category;
    if (jobRole) query.jobRole = jobRole;
    if (difficulty) query.difficulty = difficulty;
    if (skill) query.skill = new RegExp(skill, 'i');
    if (company) query.company = new RegExp(company, 'i');

    const questions = await Question.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: questions.length, questions });
  } catch (err) {
    next(err);
  }
};

// @desc    Create question
// @route   POST /api/questions
// @access  Private (Admin / HR)
const createQuestion = async (req, res, next) => {
  try {
    const { question, category, jobRole, difficulty, type, evaluationCriteria, skill, company } = req.body;

    if (!question || !category || !jobRole) {
      return res.status(400).json({ success: false, message: 'Question, category, and job role are required' });
    }

    const newQuestion = await Question.create({
      question,
      category,
      jobRole,
      difficulty: difficulty || 'Intermediate',
      type: type || 'Text',
      source: req.user.role === 'ADMIN' ? 'System' : 'HR',
      evaluationCriteria: evaluationCriteria || [],
      skill: skill || '',
      company: company || ''
    });

    res.status(201).json({ success: true, question: newQuestion });
  } catch (err) {
    next(err);
  }
};

// @desc    Generate questions using AI
// @route   POST /api/ai/generate-questions
// @access  Private (HR / Student / Admin)
const generateAIQuestions = async (req, res, next) => {
  try {
    const { category, jobRole, difficulty, questionCount, requiredSkills, jobDescription } = req.body;

    if (!category || !jobRole) {
      return res.status(400).json({ success: false, message: 'Category and Job Role are required for question generation' });
    }

    const questions = await generateInterviewQuestions({
      category,
      jobRole,
      difficulty: difficulty || 'Intermediate',
      questionCount: parseInt(questionCount) || 5,
      requiredSkills: requiredSkills || [],
      jobDescription: jobDescription || ''
    });

    res.json({ success: true, count: questions.length, questions });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getQuestions,
  createQuestion,
  generateAIQuestions
};
