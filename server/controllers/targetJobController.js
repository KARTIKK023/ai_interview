const TargetJob = require('../models/TargetJob');

// Helper to get logged in student's IDs
const getStudentIds = (user) => {
  const userStudentId = user.studentId || (user._id ? user._id.toString() : '');
  const userMongoId = user._id ? user._id.toString() : '';
  return { userStudentId, userMongoId };
};

// @desc    Create new Target Job
// @route   POST /api/target-jobs
// @access  Private (Student)
const createTargetJob = async (req, res, next) => {
  try {
    const { userStudentId, userMongoId } = getStudentIds(req.user);
    const student_id = userStudentId || userMongoId;

    if (!student_id) {
      return res.status(401).json({ success: false, message: 'Student identification failed' });
    }

    const {
      target_job_role,
      target_industry,
      target_company,
      experience,
      required_skills,
      preferred_location,
      job_type,
      expected_salary,
      job_description,
      job_url
    } = req.body;

    if (!target_job_role || !target_job_role.trim()) {
      return res.status(400).json({ success: false, message: 'Target Job Role is required' });
    }

    // Format required_skills array
    let skillsArray = [];
    if (Array.isArray(required_skills)) {
      skillsArray = required_skills.map((s) => String(s).trim()).filter(Boolean);
    } else if (typeof required_skills === 'string' && required_skills.trim()) {
      skillsArray = required_skills.split(',').map((s) => s.trim()).filter(Boolean);
    }

    const targetJob = await TargetJob.create({
      student_id,
      target_job_role: target_job_role.trim(),
      target_industry: (target_industry || '').trim(),
      target_company: (target_company || '').trim(),
      experience: (experience || 'Fresher').trim(),
      required_skills: skillsArray,
      preferred_location: (preferred_location || '').trim(),
      job_type: (job_type || 'Full Time').trim(),
      expected_salary: (expected_salary || '').trim(),
      job_description: (job_description || '').trim(),
      job_url: (job_url || '').trim()
    });

    return res.status(201).json({
      success: true,
      message: 'Target job saved successfully',
      targetJob
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in student's Target Jobs
// @route   GET /api/target-jobs
// @access  Private (Student)
const getMyTargetJobs = async (req, res, next) => {
  try {
    const { userStudentId, userMongoId } = getStudentIds(req.user);
    const query = [];
    if (userStudentId) query.push({ student_id: userStudentId });
    if (userMongoId) query.push({ student_id: userMongoId });

    const targetJobs = await TargetJob.find(
      query.length > 0 ? { $or: query } : { student_id: userMongoId }
    ).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: targetJobs.length,
      targetJobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single Target Job by ID
// @route   GET /api/target-jobs/:id
// @access  Private (Student)
const getTargetJobById = async (req, res, next) => {
  try {
    const { userStudentId, userMongoId } = getStudentIds(req.user);
    const targetJob = await TargetJob.findById(req.params.id);

    if (!targetJob) {
      return res.status(404).json({ success: false, message: 'Target job not found' });
    }

    const isOwner =
      targetJob.student_id === userStudentId ||
      targetJob.student_id === userMongoId ||
      (req.user.role && req.user.role.toLowerCase() === 'student');

    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to view another student’s target job' });
    }

    return res.json({
      success: true,
      targetJob
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Target Job
// @route   PUT /api/target-jobs/:id
// @access  Private (Student)
const updateTargetJob = async (req, res, next) => {
  try {
    const { userStudentId, userMongoId } = getStudentIds(req.user);
    const targetJob = await TargetJob.findById(req.params.id);

    if (!targetJob) {
      return res.status(404).json({ success: false, message: 'Target job not found' });
    }

    const isOwner =
      targetJob.student_id === userStudentId ||
      targetJob.student_id === userMongoId;

    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit another student’s target job' });
    }

    const {
      target_job_role,
      target_industry,
      target_company,
      experience,
      required_skills,
      preferred_location,
      job_type,
      expected_salary,
      job_description,
      job_url
    } = req.body;

    if (target_job_role !== undefined) targetJob.target_job_role = target_job_role.trim();
    if (target_industry !== undefined) targetJob.target_industry = target_industry.trim();
    if (target_company !== undefined) targetJob.target_company = target_company.trim();
    if (experience !== undefined) targetJob.experience = experience.trim();
    if (preferred_location !== undefined) targetJob.preferred_location = preferred_location.trim();
    if (job_type !== undefined) targetJob.job_type = job_type.trim();
    if (expected_salary !== undefined) targetJob.expected_salary = expected_salary.trim();
    if (job_description !== undefined) targetJob.job_description = job_description.trim();
    if (job_url !== undefined) targetJob.job_url = job_url.trim();

    if (required_skills !== undefined) {
      if (Array.isArray(required_skills)) {
        targetJob.required_skills = required_skills.map((s) => String(s).trim()).filter(Boolean);
      } else if (typeof required_skills === 'string') {
        targetJob.required_skills = required_skills.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }

    // student_id MUST NEVER be changed
    await targetJob.save();

    return res.json({
      success: true,
      message: 'Target job updated successfully',
      targetJob
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Target Job
// @route   DELETE /api/target-jobs/:id
// @access  Private (Student)
const deleteTargetJob = async (req, res, next) => {
  try {
    const { userStudentId, userMongoId } = getStudentIds(req.user);
    const targetJob = await TargetJob.findById(req.params.id);

    if (!targetJob) {
      return res.status(404).json({ success: false, message: 'Target job not found' });
    }

    const isOwner =
      targetJob.student_id === userStudentId ||
      targetJob.student_id === userMongoId;

    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete another student’s target job' });
    }

    await TargetJob.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: 'Target job deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTargetJob,
  getMyTargetJobs,
  getTargetJobById,
  updateTargetJob,
  deleteTargetJob
};
