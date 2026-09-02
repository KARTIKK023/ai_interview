const mongoose = require('mongoose');
const Interview = require('../models/Interview');
const Answer = require('../models/Answer');
const Evaluation = require('../models/Evaluation');
const TargetJob = require('../models/TargetJob');
const Certificate = require('../models/Certificate');
const {
  generateInterviewQuestions,
  cleanAndDeduplicateQuestions,
  evaluateAnswer,
  evaluateAnswerBatch,
  generateFollowUpQuestion,
  generateFinalReport
} = require('../services/aiService');

const sanitizeMapKeys = (mapObj) => {
  if (!mapObj) return {};
  const cleaned = {};
  if (mapObj instanceof Map) {
    mapObj.forEach((val, key) => {
      const cleanKey = String(key).replace(/\./g, ' ').replace(/\s+/g, ' ').trim();
      cleaned[cleanKey] = typeof val === 'number' ? val : (parseInt(val) || 0);
    });
  } else if (typeof mapObj === 'object') {
    Object.keys(mapObj).forEach((key) => {
      const cleanKey = String(key).replace(/\./g, ' ').replace(/\s+/g, ' ').trim();
      cleaned[cleanKey] = typeof mapObj[key] === 'number' ? mapObj[key] : (parseInt(mapObj[key]) || 0);
    });
  }
  return cleaned;
};

const getInterviewTargetJobSnapshot = (interview) => {
  if (interview && interview.targetJobSnapshot && interview.targetJobSnapshot.target_job_role) {
    return interview.targetJobSnapshot;
  }
  return {
    target_job_role: interview ? (interview.jobRole || 'Software Engineer') : 'Software Engineer',
    target_company: '',
    target_industry: '',
    experience: interview ? (interview.difficulty || 'Fresher') : 'Fresher',
    preferred_location: '',
    job_type: 'Full Time',
    expected_salary: '',
    required_skills: [],
    job_description: ''
  };
};

// @desc    Create interview (Practice or Recruitment)
// @route   POST /api/interviews
// @access  Private
const createInterview = async (req, res, next) => {
  try {
    const {
      title,
      jobId,
      targetJobId,
      category: reqCategory,
      jobRole: reqJobRole,
      purpose = 'Practice',
      mode = 'Text',
      difficulty = 'Intermediate',
      questionCount = 5,
      level,
      questions = [],
      duration = 30
    } = req.body;

    let finalQuestionCount = 5;
    let validatedLevel = null;

    if (level) {
      const parsedLevel = parseInt(level);
      if (parsedLevel >= 1 && parsedLevel <= 10) {
        validatedLevel = parsedLevel;
        finalQuestionCount = 10 + (parsedLevel - 1) * 5;
      }
    } else if (req.body.questionCount !== undefined && req.body.questionCount !== null && req.body.questionCount !== '') {
      finalQuestionCount = parseInt(req.body.questionCount) || 5;
    }

    let targetJob = null;
    let finalJobRole = reqJobRole;
    let finalCategory = reqCategory;

    // If targetJobId provided, fetch from MongoDB and strictly verify ownership
    if (targetJobId) {
      if (!mongoose.Types.ObjectId.isValid(targetJobId)) {
        return res.status(404).json({ success: false, message: 'Target job not found' });
      }

      targetJob = await TargetJob.findById(targetJobId);
      if (!targetJob) {
        return res.status(404).json({ success: false, message: 'Target job not found' });
      }

      const userStudentId = req.user?.studentId || (req.user?._id ? req.user._id.toString() : '');
      const userMongoId = req.user?._id ? req.user._id.toString() : '';

      const isOwner =
        String(targetJob.student_id) === String(userStudentId) ||
        String(targetJob.student_id) === String(userMongoId) ||
        (req.user?.role && req.user.role.toLowerCase() === 'student');

      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'Not authorized to access another student’s target job' });
      }

      finalJobRole = targetJob.target_job_role || reqJobRole;

      // Auto detect domain if not provided
      if (!finalCategory) {
        const roleLower = (finalJobRole || '').toLowerCase();
        const skillsStr = (targetJob.required_skills || []).join(' ').toLowerCase();
        const descStr = (targetJob.job_description || '').toLowerCase();
        const combined = `${roleLower} ${skillsStr} ${descStr}`;

        if (
          combined.includes('developer') ||
          combined.includes('software') ||
          combined.includes('engineer') ||
          combined.includes('data') ||
          combined.includes('python') ||
          combined.includes('java') ||
          combined.includes('react') ||
          combined.includes('node') ||
          combined.includes('tech') ||
          combined.includes('ai') ||
          combined.includes('ml') ||
          combined.includes('qa')
        ) {
          finalCategory = 'Technical';
        } else {
          finalCategory = 'Non-Technical';
        }
      }
    }

    if (!finalCategory || !finalJobRole || !String(finalJobRole).trim()) {
      return res.status(400).json({ success: false, message: 'Category and Job Role are required' });
    }

    // Build immutable Target Job Snapshot for this interview session
    const targetJobSnapshot = targetJob ? {
      target_job_role: targetJob.target_job_role || finalJobRole,
      target_company: targetJob.target_company || '',
      target_industry: targetJob.target_industry || '',
      experience: targetJob.experience || 'Fresher',
      preferred_location: targetJob.preferred_location || '',
      job_type: targetJob.job_type || 'Full Time',
      expected_salary: targetJob.expected_salary || '',
      required_skills: targetJob.required_skills || [],
      job_description: targetJob.job_description || ''
    } : {
      target_job_role: finalJobRole,
      target_company: '',
      target_industry: '',
      experience: 'Fresher',
      preferred_location: '',
      job_type: 'Full Time',
      expected_salary: '',
      required_skills: [],
      job_description: ''
    };

    const validJobId = (jobId && mongoose.Types.ObjectId.isValid(jobId)) ? jobId : null;
    const validTargetJobId = (targetJobId && mongoose.Types.ObjectId.isValid(targetJobId)) ? targetJobId : (targetJob?._id || null);

    // Retrieve previous questions used by the same user for this Target Job
    let previousQuestions = [];
    if (req.user) {
      const historyFilter = { createdBy: req.user._id };
      if (validTargetJobId) {
        historyFilter.targetJobId = validTargetJobId;
      } else if (finalJobRole) {
        historyFilter.jobRole = finalJobRole;
      }

      const pastInterviews = await Interview.find(historyFilter, 'questions').sort({ createdAt: -1 }).limit(20);
      pastInterviews.forEach(inv => {
        if (Array.isArray(inv.questions)) {
          inv.questions.forEach(q => {
            if (q && q.questionText && q.questionText.trim()) {
              previousQuestions.push(q.questionText.trim());
            }
          });
        }
      });
    }

    let finalQuestions = questions;

    // Generate dynamic questions using Target Job Snapshot and Previous Questions History
    if (!finalQuestions || !Array.isArray(finalQuestions) || finalQuestions.length === 0) {
      const generated = await generateInterviewQuestions({
        category: finalCategory,
        jobRole: finalJobRole,
        difficulty,
        level: validatedLevel,
        questionCount: finalQuestionCount,
        requiredSkills: targetJobSnapshot.required_skills,
        jobDescription: targetJobSnapshot.job_description,
        targetJobContext: targetJobSnapshot,
        previousQuestions
      });
      finalQuestions = generated;
    }

    const cleanedQuestions = cleanAndDeduplicateQuestions(
      finalQuestions,
      finalCategory,
      finalJobRole,
      difficulty,
      finalQuestionCount,
      [],
      targetJobSnapshot,
      validatedLevel,
      previousQuestions
    );

    const interview = await Interview.create({
      title: title || `${finalJobRole} ${purpose} Interview`,
      jobId: validJobId,
      targetJobId: validTargetJobId,
      targetJobSnapshot,
      createdBy: req.user._id,
      candidateId: purpose === 'Practice' ? req.user._id : null,
      category: finalCategory,
      jobRole: finalJobRole,
      purpose,
      mode,
      difficulty,
      questions: cleanedQuestions,
      duration: duration || 30,
      status: 'Pending'
    });

    res.status(201).json({ success: true, interview });
  } catch (err) {
    next(err);
  }
};

// @desc    Start Interview session
// @route   POST /api/interviews/:id/start
// @access  Private
const startInterview = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

    // Clean any legacy duplicate / repeating questions automatically
    if (interview.questions && Array.isArray(interview.questions)) {
      interview.questions = cleanAndDeduplicateQuestions(
        interview.questions,
        interview.category || 'Technical',
        interview.jobRole || 'Software Engineer',
        interview.difficulty || 'Intermediate',
        interview.questions.length
      );
    }

    interview.status = 'In Progress';
    interview.startedAt = interview.startedAt || new Date();
    if (!interview.candidateId) {
      interview.candidateId = req.user._id;
    }

    await interview.save();
    res.json({ success: true, interview });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit single answer & get instant AI evaluation + dynamic follow up
// @route   POST /api/interviews/:id/answer
// @access  Private
const submitAnswer = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    const { questionIndex, answerText, transcript, audioUrl, videoUrl, videoMetadata } = req.body;
    const interview = await Interview.findById(req.params.id);

    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

    // Validate ownership
    if (interview.candidateId && interview.candidateId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to submit answers for this interview' });
    }

    // Check status
    if (interview.status === 'Completed') {
      return res.status(400).json({ success: false, message: 'Interview session has already been completed' });
    }

    const currentQuestion = interview.questions[questionIndex];
    if (!currentQuestion) {
      return res.status(400).json({ success: false, message: 'Invalid question index' });
    }

    const textToEvaluate = answerText || transcript || (videoMetadata ? "Candidate provided video response." : "Spoken video answer recorded.");

    // Retrieve TargetJob context from interview snapshot
    const targetJobContext = getInterviewTargetJobSnapshot(interview);

    // AI Evaluation of current answer
    const aiEval = await evaluateAnswer({
      questionIndex,
      category: interview.category,
      jobRole: interview.jobRole,
      difficulty: interview.difficulty,
      questionText: currentQuestion.questionText,
      answerText: textToEvaluate,
      transcript: transcript || textToEvaluate,
      criteria: currentQuestion.evaluationCriteria,
      targetJobContext
    });

    const recordedVideoUrl = videoUrl || (videoMetadata ? `video_rec_${interview._id}_q${questionIndex}.webm` : '');

    // Save Answer in DB
    const answerDoc = await Answer.findOneAndUpdate(
      { interviewId: interview._id, questionIndex },
      {
        interviewId: interview._id,
        questionIndex,
        questionText: currentQuestion.questionText,
        candidateId: req.user._id,
        answerText: textToEvaluate,
        transcript: transcript || textToEvaluate,
        audioUrl: audioUrl || '',
        videoUrl: recordedVideoUrl,
        score: aiEval.score,
        isRelevant: aiEval.isRelevant !== false,
        evaluationReason: aiEval.evaluationReason || (aiEval.isRelevant ? 'Relevant Answer' : 'Unrelated / Random Answer'),
        criteriaScores: aiEval.criteriaScores,
        feedback: aiEval.feedback,
        strengths: aiEval.strengths || [],
        weaknesses: aiEval.weaknesses || aiEval.improvements || [],
        improvements: aiEval.weaknesses || aiEval.improvements || []
      },
      { upsert: true, new: true }
    );

    // AI Follow up question generation
    let followUpQuestion = null;
    if (textToEvaluate && textToEvaluate.trim().length > 15 && questionIndex < interview.questions.length - 1) {
      followUpQuestion = await generateFollowUpQuestion({
        category: interview.category,
        jobRole: interview.jobRole,
        difficulty: interview.difficulty,
        questionText: currentQuestion.questionText,
        answerText: textToEvaluate
      });
    }

    res.json({
      success: true,
      answer: answerDoc,
      evaluation: aiEval,
      followUpQuestion
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit video recording file answer
// @route   POST /api/interviews/:id/video-answer
// @access  Private
const submitVideoAnswer = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    const { questionIndex, transcript } = req.body;
    const interview = await Interview.findById(req.params.id);

    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

    if (interview.candidateId && interview.candidateId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized for this interview' });
    }

    const qIdx = parseInt(questionIndex) || 0;
    const currentQuestion = interview.questions[qIdx];
    if (!currentQuestion) {
      return res.status(400).json({ success: false, message: 'Invalid question index' });
    }

    let videoUrl = req.file ? `/uploads/${req.file.filename}` : '';
    const textToEvaluate = transcript || 'Spoken video response recorded.';

    const targetJobContext = getInterviewTargetJobSnapshot(interview);

    const aiEval = await evaluateAnswer({
      questionIndex: qIdx,
      category: interview.category,
      jobRole: interview.jobRole,
      difficulty: interview.difficulty,
      questionText: currentQuestion.questionText,
      answerText: textToEvaluate,
      transcript: textToEvaluate,
      criteria: currentQuestion.evaluationCriteria,
      targetJobContext
    });

    const answerDoc = await Answer.findOneAndUpdate(
      { interviewId: interview._id, questionIndex: qIdx },
      {
        interviewId: interview._id,
        questionIndex: qIdx,
        questionText: currentQuestion.questionText,
        candidateId: req.user._id,
        answerText: textToEvaluate,
        transcript: textToEvaluate,
        videoUrl,
        score: aiEval.score,
        isRelevant: aiEval.isRelevant !== false,
        evaluationReason: aiEval.evaluationReason || (aiEval.isRelevant ? 'Relevant Answer' : 'Unrelated / Random Answer'),
        criteriaScores: sanitizeMapKeys(aiEval.criteriaScores),
        feedback: aiEval.feedback,
        strengths: aiEval.strengths || [],
        weaknesses: aiEval.weaknesses || aiEval.improvements || [],
        improvements: aiEval.weaknesses || aiEval.improvements || []
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      answer: answerDoc,
      evaluation: aiEval
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Complete interview & generate final detailed report
// @route   POST /api/interviews/:id/complete
// @access  Private
const completeInterview = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

    const answers = await Answer.find({ interviewId: interview._id });

    // Generate Final Report using AI Service
    let finalReport;
    try {
      finalReport = await generateFinalReport({
        category: interview.category || 'Technical',
        jobRole: interview.jobRole || 'Software Engineer',
        purpose: interview.purpose || 'Practice',
        answers,
        duration: interview.duration || 15
      });
    } catch (repErr) {
      console.error('Complete interview final report generation error:', repErr.message);
      const avgScore = answers.length > 0
        ? Math.round(answers.reduce((acc, a) => acc + (a.score || 0), 0) / answers.length)
        : 75;

      finalReport = {
        overallScore: avgScore,
        roleSpecificScores: { 'Answer Relevance': avgScore, 'Accuracy': avgScore, 'Technical Knowledge': avgScore, 'Problem Solving': avgScore, 'Answer Quality': avgScore },
        strengths: ['Completed interview session'],
        weaknesses: ['Review areas for score optimization'],
        recommendations: ['Practice role-specific technical drills'],
        summary: `Candidate completed interview scoring ${avgScore}%.`,
        aiRecommendation: avgScore >= 75 ? 'Strong Candidate' : 'Needs Review'
      };
    }

    const candId = (req.user && req.user._id) ? req.user._id : (interview.candidateId || interview.createdBy);

    // Save Evaluation Document
    const evaluation = await Evaluation.findOneAndUpdate(
      { interviewId: interview._id },
      {
        interviewId: interview._id,
        candidateId: candId,
        overallScore: finalReport.overallScore,
        roleSpecificScores: sanitizeMapKeys(finalReport.roleSpecificScores),
        strengths: finalReport.strengths,
        weaknesses: finalReport.weaknesses,
        recommendations: finalReport.recommendations,
        summary: finalReport.summary,
        aiRecommendation: finalReport.aiRecommendation
      },
      { upsert: true, new: true }
    );

    const questionsArr = Array.isArray(interview.questions) ? interview.questions : [];
    const total_questions = questionsArr.length > 0 ? questionsArr.length : answers.length;
    const answered_questions = answers.filter(
      (a) => a.answerText && a.answerText.trim() !== 'No answer provided.' && a.answerText.trim().length > 0
    ).length;
    const student_id = (req.user && req.user.studentId) || (req.user && req.user._id ? req.user._id.toString() : '');

    const evalMetrics = sanitizeMapKeys(finalReport.roleSpecificScores);
    if (Object.keys(evalMetrics).length === 0) {
      evalMetrics['Answer Relevance'] = finalReport.overallScore || 0;
      evalMetrics['Accuracy'] = finalReport.overallScore || 0;
      evalMetrics['Technical Knowledge'] = finalReport.overallScore || 0;
      evalMetrics['Problem Solving'] = finalReport.overallScore || 0;
      evalMetrics['Answer Quality'] = finalReport.overallScore || 0;
    }

    interview.status = 'Completed';
    interview.completedAt = new Date();
    interview.score = finalReport.overallScore;
    interview.percentage = finalReport.overallScore;
    interview.total_questions = total_questions;
    interview.answered_questions = answered_questions;
    interview.student_id = student_id;
    interview.evaluation = evalMetrics;
    await interview.save();

    res.json({
      success: true,
      interview,
      evaluation
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit complete interview with all questions & answers at once
// @route   POST /api/interviews/:id/submit
// @access  Private

const submitFullInterview = async (req, res, next) => {
  try {
    // ------------------------------------------------------------
    // 1. Validate interview ID
    // ------------------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found',
      });
    }

    // ------------------------------------------------------------
    // 2. Find interview
    // ------------------------------------------------------------

    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found',
      });
    }

    // ------------------------------------------------------------
    // 3. Get submitted answers
    // ------------------------------------------------------------

    const {
      answers: incomingAnswers = [],
    } = req.body;

    if (
      !Array.isArray(incomingAnswers) ||
      incomingAnswers.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'No answers were submitted.',
      });
    }

    const questionsArr = Array.isArray(interview.questions)
      ? interview.questions
      : [];

    const targetJobContext =
      getInterviewTargetJobSnapshot(interview);

    // ------------------------------------------------------------
    // 4. Prepare answers
    //
    // IMPORTANT:
    // We DO NOT call AI here.
    //
    // We only normalize the answers and save them first.
    // ------------------------------------------------------------

    const preparedAnswers = [];

    const notAnsweredPlaceholders = [
      '',
      'no answer provided',
      'no answer provided.',
      'spoken video response recorded',
      'spoken video response recorded.',
      'spoken video response',
      'video response recorded',
      'no answer',
      'not answered',
      'no response',
      'none',
      'nothing',
      'n/a',
      'na',
      'idk',
      'dont know',
      "don't know",
      'no idea',
      'click start answer and speak naturally',
    ];

    for (
      let i = 0;
      i < incomingAnswers.length;
      i++
    ) {
      const item = incomingAnswers[i] || {};

      const qIdx =
        typeof item.questionIndex === 'number'
          ? item.questionIndex
          : i;

      const questionObj =
        questionsArr[qIdx] || null;

      const qText =
        item.questionText ||
        (
          questionObj
            ? (
                questionObj.questionText ||
                questionObj.question
              )
            : null
        ) ||
        `Question ${qIdx + 1}`;

      const rawAnswer = (
        item.answerText ||
        item.transcript ||
        ''
      ).trim();

      const cleanAnswer = rawAnswer
        .toLowerCase()
        .replace(
          /[.,/#!$%^&*;:{}=\-_\`~()]/g,
          ''
        )
        .trim();

      const isUnanswered =
        !rawAnswer ||
        rawAnswer.length < 2 ||
        notAnsweredPlaceholders.includes(
          cleanAnswer
        );

      const storedAnswerText = isUnanswered
        ? 'No Answer Provided'
        : rawAnswer;

      preparedAnswers.push({
        questionIndex: qIdx,
        questionText: qText,
        answerText: storedAnswerText,
        isUnanswered,
        questionObj,
      });
    }

    console.log(
      '\n============================================================'
    );

    console.log(
      '[INTERVIEW SUBMIT] Answers prepared'
    );

    console.log(
      `Total answers: ${preparedAnswers.length}`
    );

    console.log(
      'AI evaluation has NOT started yet.'
    );

    console.log(
      '============================================================\n'
    );

    // ------------------------------------------------------------
    // 5. Save answers WITHOUT AI evaluation
    // ------------------------------------------------------------

    const candId =
      req.user && req.user._id
        ? req.user._id
        : interview.candidateId ||
          interview.createdBy;

    const savedAnswerDocs = [];

    for (const item of preparedAnswers) {
      const answerDoc =
        await Answer.findOneAndUpdate(
          {
            interviewId: interview._id,
            questionIndex: item.questionIndex,
          },

          {
            interviewId: interview._id,
            questionIndex: item.questionIndex,
            questionText: item.questionText,
            candidateId: candId,

            answerText: item.answerText,
            transcript: item.answerText,

            // These are temporary values.
            // They will be replaced after batch evaluation.
            score: item.isUnanswered ? 0 : 0,

            isRelevant: item.isUnanswered
              ? false
              : false,

            evaluationReason:
              item.isUnanswered
                ? 'Not Answered'
                : 'Pending AI Evaluation',

            criteriaScores: {},

            feedback: '',

            strengths: [],

            weaknesses: [],

            improvements: [],
          },

          {
            upsert: true,
            new: true,
          }
        );

      savedAnswerDocs.push(answerDoc);
    }

    // ------------------------------------------------------------
    // 6. Split answers into batches of 5
    // ------------------------------------------------------------

    const BATCH_SIZE = 4;

    const batches = [];

    for (
      let i = 0;
      i < preparedAnswers.length;
      i += BATCH_SIZE
    ) {
      batches.push(
        preparedAnswers.slice(
          i,
          i + BATCH_SIZE
        )
      );
    }

    console.log(
      `\n[AI BATCH] Created ${batches.length} batches`
    );

    console.log(
      `[AI BATCH] Batch size: ${BATCH_SIZE}`
    );

    // ------------------------------------------------------------
    // 7. Evaluate batches SEQUENTIALLY
    //
    // We intentionally use for...of instead of Promise.all().
    //
    // This prevents 5 Groq requests from being fired
    // simultaneously and helps with rate limits.
    // ------------------------------------------------------------

    for (
      let batchIndex = 0;
      batchIndex < batches.length;
      batchIndex++
    ) {
      const batch = batches[batchIndex];

      console.log(
        `\n------------------------------------------------------------`
      );

      console.log(
        `[AI BATCH] Processing batch ${
          batchIndex + 1
        }/${batches.length}`
      );

      console.log(
        `[AI BATCH] Questions: ${batch
          .map((item) => item.questionIndex + 1)
          .join(', ')}`
      );

      console.log(
        `------------------------------------------------------------`
      );

      // ----------------------------------------------------------
      // Separate unanswered answers from real answers.
      //
      // Unanswered answers don't need an AI call.
      // ----------------------------------------------------------

      const validItems =
        batch.filter(
          (item) => !item.isUnanswered
        );

      const invalidItems =
        batch.filter(
          (item) => item.isUnanswered
        );

      // ----------------------------------------------------------
      // Handle unanswered answers locally
      // ----------------------------------------------------------

      for (const item of invalidItems) {
        await Answer.findOneAndUpdate(
          {
            interviewId: interview._id,
            questionIndex: item.questionIndex,
          },

          {
            score: 0,
            isRelevant: false,
            evaluationReason: 'Not Answered',
            criteriaScores: {
              'Answer Relevance': 0,
              Accuracy: 0,
              'Technical Knowledge': 0,
              'Problem Solving': 0,
              'Answer Quality': 0,
            },
            feedback:
              'No answer was provided.',
            strengths: [],
            weaknesses: [
              'No answer provided',
            ],
            improvements: [
              'Provide a direct answer to the question.',
            ],
          }
        );
      }

      // ----------------------------------------------------------
      // Nothing to send to AI in this batch
      // ----------------------------------------------------------

      if (validItems.length === 0) {
        console.log(
          `[AI BATCH] Batch ${
            batchIndex + 1
          } contains no valid answers.`
        );

        continue;
      }

      // ----------------------------------------------------------
      // Call ONE AI request for this batch
      // ----------------------------------------------------------

      try {
        const batchResults =
          await evaluateAnswerBatch({
            questions: validItems.map(
              (item) => ({
                questionText:
                  item.questionText,

                evaluationCriteria:
                  item.questionObj
                    ? item.questionObj
                        .evaluationCriteria
                    : [],
              })
            ),

            answers: validItems.map(
              (item) => ({
                answer:
                  item.answerText,

                transcript:
                  item.answerText,
              })
            ),

            targetJob:
              targetJobContext,
          });

        // --------------------------------------------------------
        // Save each returned evaluation
        // --------------------------------------------------------

        for (const result of batchResults) {
          const batchQuestionIndex =
            Number(result.questionIndex);

          // The AI returns an index relative to THIS batch:
          // 0, 1, 2, 3...
          //
          // We need to convert that back to the
          // original interview question.

          const originalItem =
            validItems[batchQuestionIndex];

          if (!originalItem) {
            console.warn(
              `[AI BATCH] Invalid batch question index: ${batchQuestionIndex}`
            );

            continue;
          }

          const questionIndex =
            originalItem.questionIndex;

          console.log(
            `[AI BATCH] Mapping batch Q${batchQuestionIndex}`
            + ` → Interview Q${questionIndex + 1}`
          );

          await Answer.findOneAndUpdate(
            {
              interviewId: interview._id,

              questionIndex:
                questionIndex,
            },

            {
              score:
                Number(result.score) || 0,

              isRelevant:
                result.isRelevant !== false,

              evaluationReason:
                result.evaluationReason ||
                (
                  result.isRelevant === false
                    ? 'Unrelated / Random Answer'
                    : 'Relevant Answer'
                ),

              criteriaScores:
                sanitizeMapKeys(
                  result.criteriaScores
                ),

              feedback:
                result.feedback || '',

              strengths:
                Array.isArray(result.strengths)
                  ? result.strengths
                  : [],

              weaknesses:
                Array.isArray(result.weaknesses)
                  ? result.weaknesses
                  : [],

              improvements:
                Array.isArray(result.improvements)
                  ? result.improvements
                  : (
                      Array.isArray(result.weaknesses)
                        ? result.weaknesses
                        : []
                    ),
            }
          );
        }

        console.log(
          `[AI BATCH] Batch ${
            batchIndex + 1
          } completed successfully.`
        );

      } catch (batchError) {
        // --------------------------------------------------------
        // If the entire batch fails, don't crash the interview.
        //
        // Give unanswered/default scores to the affected answers.
        // --------------------------------------------------------

        console.error(
          `[AI BATCH] Batch ${
            batchIndex + 1
          } failed:`,
          batchError.message
        );

        for (const item of validItems) {
          await Answer.findOneAndUpdate(
            {
              interviewId: interview._id,
              questionIndex:
                item.questionIndex,
            },

            {
              score: 0,

              isRelevant: false,

              evaluationReason:
                'AI Evaluation Failed',

              criteriaScores: {
                'Answer Relevance': 0,
                Accuracy: 0,
                'Technical Knowledge': 0,
                'Problem Solving': 0,
                'Answer Quality': 0,
              },

              feedback:
                'AI evaluation could not be completed. Please try again.',

              strengths: [],

              weaknesses: [
                'AI evaluation was unavailable.',
              ],

              improvements: [
                'Please retry the interview evaluation.',
              ],
            }
          );
        }
      }
    }

    // ------------------------------------------------------------
    // 8. Get ALL final answers after batch evaluation
    // ------------------------------------------------------------

    const allAnswers =
      await Answer.find({
        interviewId: interview._id,
      }).sort({
        questionIndex: 1,
      });

    // ------------------------------------------------------------
    // 9. Generate final report
    // ------------------------------------------------------------

    let finalReport;

    try {
      finalReport =
        await generateFinalReport({
          category:
            interview.category ||
            'Technical',

          jobRole:
            interview.jobRole ||
            'Software Engineer',

          purpose:
            interview.purpose ||
            'Practice',

          answers: allAnswers,

          duration:
            interview.duration || 15,
        });

    } catch (repErr) {
      console.error(
        'Final report generation warning:',
        repErr.message
      );

      const avgScore =
        allAnswers.length > 0
          ? Math.round(
              allAnswers.reduce(
                (acc, answer) =>
                  acc +
                  (answer.score || 0),
                0
              ) /
                allAnswers.length
            )
          : 0;

      finalReport = {
        overallScore: avgScore,

        roleSpecificScores: {
          'Answer Relevance':
            avgScore,

          Accuracy:
            avgScore,

          'Technical Knowledge':
            avgScore,

          'Problem Solving':
            avgScore,

          'Answer Quality':
            avgScore,
        },

        strengths: [
          'Interview completed.',
        ],

        weaknesses: [
          'Review areas with lower scores.',
        ],

        recommendations: [
          'Practice role-specific interview questions.',
        ],

        summary:
          `Candidate completed the interview with an overall score of ${avgScore}%.`,

        aiRecommendation:
          avgScore >= 75
            ? 'Strong Candidate'
            : 'Needs Review',
      };
    }

    // ------------------------------------------------------------
    // 10. Save final Evaluation document
    // ------------------------------------------------------------

    const evaluation =
      await Evaluation.findOneAndUpdate(
        {
          interviewId:
            interview._id,
        },

        {
          interviewId:
            interview._id,

          candidateId:
            candId,

          overallScore:
            finalReport.overallScore,

          roleSpecificScores:
            sanitizeMapKeys(
              finalReport.roleSpecificScores
            ),

          strengths:
            finalReport.strengths,

          weaknesses:
            finalReport.weaknesses,

          recommendations:
            finalReport.recommendations,

          summary:
            finalReport.summary,

          aiRecommendation:
            finalReport.aiRecommendation,
        },

        {
          upsert: true,
          new: true,
        }
      );

    // ------------------------------------------------------------
    // 11. Update Interview
    // ------------------------------------------------------------

    const total_questions =
      questionsArr.length > 0
        ? questionsArr.length
        : allAnswers.length;

    const answered_questions =
      allAnswers.filter(
        (answer) =>
          answer.answerText &&
          answer.answerText.trim() !==
            'No Answer Provided' &&
          answer.answerText.trim()
            .length > 0
      ).length;

    const student_id =
      (req.user &&
        req.user.studentId) ||
      (
        req.user &&
        req.user._id
          ? req.user._id.toString()
          : ''
      );

    const evalMetrics =
      sanitizeMapKeys(
        finalReport.roleSpecificScores
      );

    if (
      Object.keys(evalMetrics).length ===
      0
    ) {
      evalMetrics[
        'Answer Relevance'
      ] =
        finalReport.overallScore || 0;

      evalMetrics['Accuracy'] =
        finalReport.overallScore || 0;

      evalMetrics[
        'Technical Knowledge'
      ] =
        finalReport.overallScore || 0;

      evalMetrics[
        'Problem Solving'
      ] =
        finalReport.overallScore || 0;

      evalMetrics[
        'Answer Quality'
      ] =
        finalReport.overallScore || 0;
    }

    interview.status =
      'Completed';

    interview.completedAt =
      new Date();

    interview.score =
      finalReport.overallScore;

    interview.percentage =
      finalReport.overallScore;

    interview.total_questions =
      total_questions;

    interview.answered_questions =
      answered_questions;

    interview.student_id =
      student_id;

    interview.evaluation =
      evalMetrics;

    await interview.save();

    // ------------------------------------------------------------
    // 12. Return final result
    // ------------------------------------------------------------

    return res.json({
      success: true,

      interview,

      evaluation,

      message:
        `Interview completed. ${batches.length} AI evaluation batch(es) processed.`,
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Stop interview session without generating completed evaluation
// @route   POST /api/interviews/:id/stop
// @access  Private
const stopInterview = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

    interview.status = 'Stopped';
    interview.completedAt = new Date();
    await interview.save();

    res.json({ success: true, message: 'Interview session stopped', interview });
  } catch (err) {
    next(err);
  }
};

// @desc    Get interviews list
// @route   GET /api/interviews
// @access  Private
const getInterviews = async (req, res, next) => {
  try {
    const query = {};
    if (req.user.role === 'STUDENT' || req.user.role === 'student') {
      query.candidateId = req.user._id;
    } else if (req.user.role === 'HR' || req.user.role === 'hr') {
      query.createdBy = req.user._id;
    }

    if (req.query.purpose) query.purpose = req.query.purpose;
    if (req.query.mode) query.mode = req.query.mode;
    if (req.query.jobId && mongoose.Types.ObjectId.isValid(req.query.jobId)) {
      query.jobId = req.query.jobId;
    }

    const interviews = await Interview.find(query)
      .populate('createdBy', 'name email companyName')
      .populate('candidateId', 'name email studentId')
      .populate('jobId', 'roleName name category description')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: interviews.length, interviews });
  } catch (err) {
    next(err);
  }
};

// @desc    Get interview by ID with answers & report
// @route   GET /api/interviews/:id
// @access  Private
const getInterviewById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    const interview = await Interview.findById(req.params.id)
      .populate('createdBy', 'name email companyName')
      .populate('candidateId', 'name email')
      .populate('jobId', 'roleName name category description');

    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

    // Clean any legacy duplicate / repeating questions automatically
    if (interview.questions && Array.isArray(interview.questions)) {
      const cleaned = cleanAndDeduplicateQuestions(
        interview.questions,
        interview.category || 'Technical',
        interview.jobRole || 'Software Engineer',
        interview.difficulty || 'Intermediate',
        interview.questions.length
      );
      if (cleaned && cleaned.length > 0) {
        const hasChanged = cleaned.length !== interview.questions.length ||
          cleaned.some((q, idx) => !interview.questions[idx] || q.questionText !== interview.questions[idx].questionText);
        if (hasChanged) {
          interview.questions = cleaned;
          await interview.save();
        }
      }
    }

    const answers = await Answer.find({ interviewId: interview._id }).sort({ questionIndex: 1 });
    const evaluation = await Evaluation.findOne({ interviewId: interview._id });

    res.json({
      success: true,
      interview,
      answers,
      evaluation
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete interview and associated answers & evaluation
// @route   DELETE /api/interviews/:id
// @access  Private
const deleteInterview = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

    // Delete associated answers and evaluations
    await Answer.deleteMany({ interviewId: interview._id });
    await Evaluation.deleteMany({ interviewId: interview._id });
    await interview.deleteOne();

    res.json({ success: true, message: 'Interview session deleted successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get Certificates earned by Logged-in Student (MongoDB)
 * @route   GET /api/interviews/student/certificates
 * @access  Private (Student)
 */
const getStudentCertificates = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const studentId = req.user.studentId;

    const query = {
      $or: [
        { studentUserId: userId }
      ]
    };
    if (studentId) {
      query.$or.push({ studentId });
    }

    const certDocs = await Certificate.find(query).sort({ issuedAt: -1, createdAt: -1 }).lean();

    const formattedCertificates = certDocs.map(c => ({
      ...c,
      id: c.certificateId,
      issueDate: c.issuedAt || c.createdAt
    }));

    res.json({
      success: true,
      count: formattedCertificates.length,
      certificates: formattedCertificates
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get Single Certificate by Certificate ID for Logged-in Student (MongoDB)
 * @route   GET /api/interviews/student/certificates/:id
 * @access  Private (Student)
 */
const getStudentCertificateById = async (req, res, next) => {
  try {
    const certId = req.params.id;
    const userId = req.user._id;
    const studentId = req.user.studentId || req.user.student_id;
    const userEmail = req.user.email;

    const query = {
      $and: [
        {
          $or: [
            { certificateId: certId },
            ...(mongoose.Types.ObjectId.isValid(certId) ? [{ _id: certId }, { interviewId: certId }] : [])
          ]
        },
        {
          $or: [
            { studentUserId: userId },
            ...(studentId ? [{ studentId }] : []),
            ...(userEmail ? [{ email: userEmail }] : [])
          ]
        }
      ]
    };

    let certDoc = await Certificate.findOne(query).lean();

    if (!certDoc) {
      certDoc = await Certificate.findOne({
        $or: [
          { certificateId: certId },
          ...(mongoose.Types.ObjectId.isValid(certId) ? [{ _id: certId }] : [])
        ]
      }).lean();
    }

    if (!certDoc) {
      return res.status(404).json({
        success: false,
        message: 'Certificate record not found in MongoDB.'
      });
    }

    const formattedCert = {
      ...certDoc,
      id: certDoc.certificateId,
      issueDate: certDoc.issuedAt || certDoc.createdAt
    };

    return res.json({
      success: true,
      certificate: formattedCert
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createInterview,
  startInterview,
  submitAnswer,
  submitVideoAnswer,
  submitFullInterview,
  completeInterview,
  stopInterview,
  getInterviews,
  getInterviewById,
  deleteInterview,
  getStudentCertificates,
  getStudentCertificateById
};

