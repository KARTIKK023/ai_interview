const Interview = require('../models/Interview');
const Evaluation = require('../models/Evaluation');

// @desc    Get Student performance analytics
// @route   GET /api/analytics/student
// @access  Private (Student)
const getStudentAnalytics = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    const interviews = await Interview.find({ candidateId: studentId, status: 'Completed' })
      .sort({ completedAt: 1 });

    const totalInterviews = interviews.length;
    const practiceCount = interviews.filter(i => i.purpose === 'Practice').length;
    const hrCount = interviews.filter(i => i.purpose === 'Recruitment').length;

    let totalScoreSum = 0;
    let bestScore = 0;

    let techSum = 0, techCount = 0;
    let nonTechSum = 0, nonTechCount = 0;
    let textSum = 0, textCount = 0;
    let videoSum = 0, videoCount = 0;

    const scoreTrend = interviews.map(i => {
      const score = i.score || 0;
      totalScoreSum += score;
      if (score > bestScore) bestScore = score;

      if (i.category === 'Technical') { techSum += score; techCount++; }
      else { nonTechSum += score; nonTechCount++; }

      if (i.mode === 'Text') { textSum += score; textCount++; }
      else { videoSum += score; videoCount++; }

      return {
        date: i.completedAt ? new Date(i.completedAt).toLocaleDateString() : 'Recent',
        score,
        role: i.jobRole,
        category: i.category,
        mode: i.mode
      };
    });

    const averageScore = totalInterviews > 0 ? Math.round(totalScoreSum / totalInterviews) : 0;
    const avgTechnical = techCount > 0 ? Math.round(techSum / techCount) : 0;
    const avgNonTechnical = nonTechCount > 0 ? Math.round(nonTechSum / nonTechCount) : 0;
    const avgText = textCount > 0 ? Math.round(textSum / textCount) : 0;
    const avgVideo = videoCount > 0 ? Math.round(videoSum / videoCount) : 0;

    // Collect evaluations for strengths/weaknesses aggregation
    const evaluations = await Evaluation.find({ candidateId: studentId });
    const strengthsMap = {};
    const weaknessesMap = {};

    evaluations.forEach(ev => {
      (ev.strengths || []).forEach(s => { strengthsMap[s] = (strengthsMap[s] || 0) + 1; });
      (ev.weaknesses || []).forEach(w => { weaknessesMap[w] = (weaknessesMap[w] || 0) + 1; });
    });

    const strongAreas = Object.keys(strengthsMap).slice(0, 4);
    const weakAreas = Object.keys(weaknessesMap).slice(0, 4);

    res.json({
      success: true,
      analytics: {
        totalInterviews,
        practiceCount,
        hrCount,
        averageScore,
        bestScore,
        avgTechnical,
        avgNonTechnical,
        avgText,
        avgVideo,
        scoreTrend,
        strongAreas,
        weakAreas
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStudentAnalytics
};
