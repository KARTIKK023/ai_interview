const express = require('express');
const router = express.Router();
const { generateAIQuestions } = require('../controllers/questionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/generate-questions', generateAIQuestions);

module.exports = router;
