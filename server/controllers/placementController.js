const TargetJob = require('../models/TargetJob');
const { getMatchingJobsForTargetJob } = require('../services/jobSearchService');

/**
 * Get student IDs for query matching
 */
const getStudentIds = (user) => {
  const userStudentId = user.studentId ? user.studentId.trim() : null;
  const userMongoId = user._id ? user._id.toString() : null;
  return { userStudentId, userMongoId };
};

// @desc    Get real placement opportunities based on student's Target Jobs
// @route   GET /api/placement-opportunities
// @access  Private (Student)
const getPlacementOpportunities = async (req, res, next) => {
  try {
    const { userStudentId, userMongoId } = getStudentIds(req.user);
    const query = [];
    if (userStudentId) query.push({ student_id: userStudentId });
    if (userMongoId) query.push({ student_id: userMongoId });

    // 1. Read student's saved Target Jobs
    const targetJobs = await TargetJob.find(
      query.length > 0 ? { $or: query } : { student_id: userMongoId }
    ).sort({ createdAt: -1 });

    if (!targetJobs || targetJobs.length === 0) {
      return res.json({
        success: true,
        count: 0,
        hasTargetJobs: false,
        targetJobs: [],
        opportunities: [],
        message: 'No Target Jobs found. Please add your Target Jobs to see personalized placement opportunities.'
      });
    }

    const targetJobFilter = req.query.targetJob || 'ALL';
    const countryFilter = req.query.country || req.query.location || 'ALL';
    const stateFilter = req.query.state || 'ALL';
    const cityFilter = req.query.city || 'ALL';

    // Select the requested target job(s) for query execution
    let targetJobsToQuery = targetJobs;
    if (targetJobFilter !== 'ALL') {
      const matched = targetJobs.filter(
        (tj) => tj.target_job_role === targetJobFilter || tj._id.toString() === targetJobFilter
      );
      if (matched.length > 0) {
        targetJobsToQuery = matched;
      } else {
        // Construct target job context if user selected a target job role filter
        targetJobsToQuery = [{ _id: 'custom', target_job_role: targetJobFilter, required_skills: [] }];
      }
    }

    // 2. Fetch real opportunities for selected Target Job(s) concurrently with Country + State + City filters
    const jobsPromises = targetJobsToQuery.map((tJob) => getMatchingJobsForTargetJob(tJob, countryFilter, stateFilter, cityFilter));
    const nestedJobResults = await Promise.all(jobsPromises);

    // 3. Flatten and deduplicate opportunities
    const seenJobKeys = new Set();
    const allOpportunities = [];

    nestedJobResults.forEach((jobList) => {
      jobList.forEach((job) => {
        const key = `${job.title.toLowerCase().trim()}-${job.company.toLowerCase().trim()}`;
        if (!seenJobKeys.has(key)) {
          seenJobKeys.add(key);
          allOpportunities.push(job);
        }
      });
    });

    // 4. Sort by relevance score descending
    allOpportunities.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return res.json({
      success: true,
      hasTargetJobs: true,
      count: allOpportunities.length,
      targetJobs: targetJobs.map((tj) => ({
        _id: tj._id,
        role: tj.target_job_role,
        company: tj.target_company,
        skills: tj.required_skills || [],
        location: tj.preferred_location || '',
        type: tj.job_type || ''
      })),
      opportunities: allOpportunities
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlacementOpportunities
};
