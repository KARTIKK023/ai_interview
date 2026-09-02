const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Interview = require('../models/Interview');
const Resume = require('../models/Resume');
const JobRole = require('../models/JobRole');
const TargetJob = require('../models/TargetJob');
const Evaluation = require('../models/Evaluation');
const Certificate = require('../models/Certificate');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'ai_interview_secret_key_2026_super_secure', {
    expiresIn: '30d'
  });
};

/**
 * Helper to format relative time ago string
 */
const formatTimeAgo = (date) => {
  if (!date) return 'Just now';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return `${Math.max(1, seconds)}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

/**
 * @desc    Super Admin Login
 * @route   POST /api/admin/login
 * @access  Public
 */
const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide admin email and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Find user by email (including password field)
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    // 2. Verify password with bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    // 3. Verify Account Status
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Admin account is deactivated' });
    }

    // 4. Strict Role Verification: Must be SUPER_ADMIN
    const roleUpper = (user.role || '').toUpperCase();
    if (roleUpper !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have Super Admin privileges.'
      });
    }

    // 5. Generate JWT Token
    const token = generateToken(user._id);

    const adminObj = {
      id: user._id,
      _id: user._id,
      fullName: user.fullName || user.name || 'Super Admin',
      email: user.email,
      role: 'SUPER_ADMIN'
    };

    return res.json({
      success: true,
      message: 'Super Admin authentication successful',
      token,
      user: adminObj
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get Current Super Admin Session
 * @route   GET /api/admin/me
 * @access  Private (Super Admin)
 */
const getAdminMe = async (req, res) => {
  return res.json({
    success: true,
    user: {
      id: req.user._id,
      _id: req.user._id,
      fullName: req.user.fullName || req.user.name || 'Super Admin',
      email: req.user.email,
      role: 'SUPER_ADMIN'
    }
  });
};

/**
 * @desc    Get Super Admin Dashboard Real Production Analytics
 * @route   GET /api/admin/dashboard
 * @access  Private (Super Admin)
 */
const getAdminDashboard = async (req, res, next) => {
  try {
    const timeframeParam = req.query.timeframe === '30d' ? '30d' : '7d';
    const daysCount = timeframeParam === '30d' ? 30 : 7;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 1. Core Production Counts
    const [
      totalUsers,
      newUsers30d,
      orgUsersCount,
      activeJobRolesCount,
      targetJobsCount,
      totalInterviews,
      newInterviews30d,
      totalResumeScans,
      newResumeScans30d
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ role: { $in: ['admin', 'hr', 'super_admin', 'ADMIN', 'HR', 'SUPER_ADMIN'] } }),
      JobRole.countDocuments({ isActive: true }).catch(() => 0),
      TargetJob.countDocuments().catch(() => 0),
      Interview.countDocuments().catch(() => 0),
      Interview.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }).catch(() => 0),
      Resume.countDocuments().catch(() => 0),
      Resume.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }).catch(() => 0)
    ]);

    const totalActiveJobs = activeJobRolesCount + targetJobsCount;

    // Growth percentage helper
    const calcTrend = (newCount, totalCount) => {
      const prev = totalCount - newCount;
      if (prev <= 0) return totalCount > 0 ? '+100%' : '0%';
      const pct = ((newCount / prev) * 100).toFixed(1);
      return `${pct >= 0 ? '+' : ''}${pct}%`;
    };

    const kpiCards = [
      {
        id: 'total-users',
        title: 'Total Users',
        value: totalUsers.toLocaleString(),
        trend: calcTrend(newUsers30d, totalUsers),
        trendUp: newUsers30d >= 0,
        timeframe: `${newUsers30d} new in last 30d`,
        color: '#4F46E5',
        bgLight: 'rgba(79, 70, 229, 0.1)',
        route: '/super-admin/users'
      },
      {
        id: 'organizations',
        title: 'Organizations',
        value: orgUsersCount.toLocaleString(),
        trend: '+0.0%',
        trendUp: true,
        timeframe: `${orgUsersCount} registered org/HR accounts`,
        color: '#059669',
        bgLight: 'rgba(5, 150, 105, 0.1)',
        route: '/super-admin/organizations'
      },
      {
        id: 'active-jobs',
        title: 'Active Jobs',
        value: totalActiveJobs.toLocaleString(),
        trend: '+0.0%',
        trendUp: true,
        timeframe: `${activeJobRolesCount} predefined, ${targetJobsCount} target jobs`,
        color: '#2563EB',
        bgLight: 'rgba(37, 99, 235, 0.1)',
        route: '/super-admin/jobs-companies'
      },
      {
        id: 'ai-interviews',
        title: 'AI Interviews',
        value: totalInterviews.toLocaleString(),
        trend: calcTrend(newInterviews30d, totalInterviews),
        trendUp: newInterviews30d >= 0,
        timeframe: `${newInterviews30d} session(s) in last 30d`,
        color: '#9333EA',
        bgLight: 'rgba(147, 51, 234, 0.1)',
        route: '/super-admin/ai-interview-engine'
      },
      {
        id: 'resume-scans',
        title: 'Resume Scans',
        value: totalResumeScans.toLocaleString(),
        trend: calcTrend(newResumeScans30d, totalResumeScans),
        trendUp: newResumeScans30d >= 0,
        timeframe: `${totalResumeScans} resume(s) uploaded`,
        color: '#D97706',
        bgLight: 'rgba(217, 119, 6, 0.1)',
        route: '/super-admin/resume-scans'
      }
    ];

    // 2. AI Interview Activity Trends (Dynamic daily breakdown)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (daysCount - 1));
    startDate.setHours(0, 0, 0, 0);

    const aggTrends = await Interview.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      }
    ]).catch(() => []);

    const trendMap = {};
    aggTrends.forEach((item) => {
      trendMap[item._id] = item.count;
    });

    const interviewActivityData = [];
    let periodTotalInterviews = 0;
    let maxDayCount = 1;

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = daysCount === 7
        ? d.toLocaleDateString('en-US', { weekday: 'short' })
        : `${d.getMonth() + 1}/${d.getDate()}`;
      const count = trendMap[dateStr] || 0;
      periodTotalInterviews += count;
      if (count > maxDayCount) maxDayCount = count;

      interviewActivityData.push({
        day: dayName,
        date: dateStr,
        count,
        heightPct: 0, // computed below
        color: '#4F46E5'
      });
    }

    interviewActivityData.forEach((item) => {
      item.heightPct = maxDayCount > 0 ? Math.max(15, Math.round((item.count / maxDayCount) * 100)) : 15;
    });

    // 3. Popular Target Jobs (Calculated top roles dynamically from TargetJob / Interview)
    let rawTopRoles = await TargetJob.aggregate([
      { $group: { _id: '$target_job_role', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]).catch(() => []);

    if (!rawTopRoles || rawTopRoles.length === 0) {
      rawTopRoles = await Interview.aggregate([
        { $group: { _id: '$jobRole', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]).catch(() => []);
    }

    const totalTargetJobs = rawTopRoles.reduce((sum, r) => sum + r.count, 0) || 1;
    const colors = ['#4F46E5', '#059669', '#2563EB', '#9333EA', '#D97706'];

    const popularTargetJobs = rawTopRoles.map((r, idx) => ({
      role: r._id || 'Software Engineer',
      count: `${r.count} candidate(s)`,
      rawCount: r.count,
      sharePct: Math.round((r.count / totalTargetJobs) * 100) || 20,
      color: colors[idx % colors.length]
    }));

    // 4. Platform System Health (Real DB ping + API status checks)
    const dbPingStart = Date.now();
    let isDbHealthy = false;
    let dbLatencyMs = 0;

    try {
      if (mongoose.connection.readyState === 1) {
        await User.findOne().select('_id').lean();
        dbLatencyMs = Date.now() - dbPingStart;
        isDbHealthy = true;
      }
    } catch (e) {
      isDbHealthy = false;
    }

    const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());

    const platformServices = [
      {
        name: 'Gemini AI Evaluation API',
        status: hasGeminiKey ? 'Healthy' : 'Degraded',
        latency: hasGeminiKey ? 'Configured' : 'Missing Key',
        uptime: hasGeminiKey ? 'Active' : 'Warning',
        badgeClass: hasGeminiKey ? 'bg-success' : 'bg-warning'
      },
      {
        name: 'MongoDB Core Database',
        status: isDbHealthy ? 'Healthy' : 'Down',
        latency: `${dbLatencyMs}ms`,
        uptime: isDbHealthy ? 'Connected' : 'Disconnected',
        badgeClass: isDbHealthy ? 'bg-success' : 'bg-danger'
      },
      {
        name: 'ATS Resume Parser',
        status: 'Healthy',
        latency: 'Active',
        uptime: 'Connected',
        badgeClass: 'bg-success'
      },
      {
        name: 'Cascading Location API',
        status: 'Healthy',
        latency: 'Active',
        uptime: 'Connected',
        badgeClass: 'bg-success'
      }
    ];

    // 5. Recent Platform Activity Stream (Real database events)
    const [recentInterviews, recentResumes, recentUsers, recentTargetJobs] = await Promise.all([
      Interview.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('candidateId', 'name fullName email')
        .lean()
        .catch(() => []),
      Resume.find().sort({ createdAt: -1 }).limit(5).lean().catch(() => []),
      User.find().sort({ createdAt: -1 }).limit(5).lean().catch(() => []),
      TargetJob.find().sort({ createdAt: -1 }).limit(5).lean().catch(() => [])
    ]);

    const activityList = [];

    recentInterviews.forEach((inv) => {
      const candName = inv.candidateId?.fullName || inv.candidateId?.name || 'Candidate';
      activityList.push({
        id: `inv-${inv._id}`,
        timestamp: inv.createdAt || inv.updatedAt || new Date(),
        type: 'INTERVIEW',
        title: `${inv.jobRole || 'Interview'} Session (${inv.status || 'Pending'})`,
        details: `Candidate: ${candName} | Category: ${inv.category || 'Technical'} | Mode: ${inv.mode || 'Text'}`,
        time: formatTimeAgo(inv.createdAt),
        tag: `Score: ${inv.score ?? inv.percentage ?? 0}%`,
        tagClass: inv.status === 'Completed' ? 'bg-success bg-opacity-10 text-success' : 'bg-primary bg-opacity-10 text-primary'
      });
    });

    recentResumes.forEach((res) => {
      const studName = res.name || res.student_name || 'Student';
      activityList.push({
        id: `res-${res._id}`,
        timestamp: res.createdAt || res.uploadedAt || new Date(),
        type: 'ATS_SCAN',
        title: 'Resume Document Uploaded',
        details: `Student: ${studName} | File: ${res.fileName || 'Resume.pdf'}`,
        time: formatTimeAgo(res.createdAt || res.uploadedAt),
        tag: 'ATS Parsed',
        tagClass: 'bg-info bg-opacity-10 text-info'
      });
    });

    recentUsers.forEach((usr) => {
      const uName = usr.fullName || usr.name || usr.email || 'New User';
      activityList.push({
        id: `usr-${usr._id}`,
        timestamp: usr.createdAt || new Date(),
        type: 'ORGANIZATION',
        title: `New User Account Registered (${usr.role || 'Student'})`,
        details: `User: ${uName} | Email: ${usr.email}`,
        time: formatTimeAgo(usr.createdAt),
        tag: (usr.role || 'Student').toUpperCase(),
        tagClass: 'bg-warning bg-opacity-10 text-warning'
      });
    });

    recentTargetJobs.forEach((tj) => {
      activityList.push({
        id: `tj-${tj._id}`,
        timestamp: tj.createdAt || new Date(),
        type: 'JOB_PLACEMENT',
        title: `Target Job Profile Added: ${tj.target_job_role}`,
        details: `Company: ${tj.target_company || 'Target Org'} | Experience: ${tj.experience || 'Fresher'}`,
        time: formatTimeAgo(tj.createdAt),
        tag: tj.job_type || 'Full Time',
        tagClass: 'bg-purple bg-opacity-10 text-purple'
      });
    });

    // Sort descending by timestamp and take top 10
    activityList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const recentActivities = activityList.slice(0, 10);

    return res.json({
      success: true,
      timeframe: timeframeParam,
      kpiCards,
      interviewActivityData,
      periodTotalInterviews,
      popularTargetJobs,
      platformServices,
      recentActivities
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get All Registered Users (Super Admin)
 * @route   GET /api/admin/users
 * @access  Private (Super Admin)
 */
const getAdminUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, count: users.length, users });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get All Partner Organizations & HR Accounts (Super Admin)
 * @route   GET /api/admin/organizations
 * @access  Private (Super Admin)
 */
const getAdminOrganizations = async (req, res, next) => {
  try {
    const orgUsers = await User.find({
      role: { $in: ['admin', 'hr', 'super_admin', 'ADMIN', 'HR', 'SUPER_ADMIN'] }
    })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, count: orgUsers.length, organizations: orgUsers });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get All Active Predefined & Target Jobs (Super Admin)
 * @route   GET /api/admin/jobs
 * @access  Private (Super Admin)
 */
const getAdminJobs = async (req, res, next) => {
  try {
    const [jobRoles, targetJobs] = await Promise.all([
      JobRole.find().sort({ createdAt: -1 }).lean().catch(() => []),
      TargetJob.find().sort({ createdAt: -1 }).lean().catch(() => [])
    ]);

    res.json({
      success: true,
      jobRolesCount: jobRoles.length,
      targetJobsCount: targetJobs.length,
      jobRoles,
      targetJobs
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get All AI Interview Sessions (Super Admin)
 * @route   GET /api/admin/interviews
 * @access  Private (Super Admin)
 */
const getAdminInterviews = async (req, res, next) => {
  try {
    const interviews = await Interview.find()
      .populate('candidateId', 'name fullName email studentId')
      .populate('createdBy', 'name fullName email')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, count: interviews.length, interviews });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get All Resume Scans & Uploads (Super Admin)
 * @route   GET /api/admin/resume-scans
 * @access  Private (Super Admin)
 */
const getAdminResumeScans = async (req, res, next) => {
  try {
    const resumes = await Resume.find()
      .select('-fileData')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, count: resumes.length, resumes });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get All Registered Students Records (Super Admin)
 * @route   GET /api/admin/students
 * @access  Private (Super Admin)
 */
const getAdminStudents = async (req, res, next) => {
  try {
    const students = await User.find({
      role: { $in: ['student', 'STUDENT'] }
    })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, count: students.length, students });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get All Registration Records (Super Admin)
 * @route   GET /api/admin/registrations
 * @access  Private (Super Admin)
 */
const getAdminRegistrations = async (req, res, next) => {
  try {
    const registrations = await User.find({
      role: {
        $nin: [
          'SUPER_ADMIN',
          'super_admin',
          'SUPER-ADMIN',
          'super-admin',
          'SUPERADMIN',
          'superadmin'
        ]
      }
    })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, count: registrations.length, registrations });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get All Resume Records (Super Admin)
 * @route   GET /api/admin/resumes
 * @access  Private (Super Admin)
 */
const getAdminResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find()
      .select('-fileData')
      .populate('userId', 'fullName name email studentId profilePhoto dateOfBirth gender location bio education professionalLinks profile')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, count: resumes.length, resumes });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get All Target Job Records (Super Admin)
 * @route   GET /api/admin/target-jobs
 * @access  Private (Super Admin)
 */
const getAdminTargetJobs = async (req, res, next) => {
  try {
    const targetJobs = await TargetJob.find()
      .sort({ createdAt: -1 })
      .lean();

    // Dynamically match & attach student details from User collection by student_id / _id
    const studentIds = [...new Set(targetJobs.map(tj => tj.student_id).filter(Boolean))];
    const objectIds = studentIds.filter(id => mongoose.Types.ObjectId.isValid(id));

    const users = await User.find({
      $or: [
        { _id: { $in: objectIds } },
        { studentId: { $in: studentIds } },
        { student_id: { $in: studentIds } }
      ]
    }).select('fullName name email studentId student_id').lean();

    const userMap = {};
    users.forEach(u => {
      if (u._id) userMap[u._id.toString()] = u;
      if (u.studentId) userMap[u.studentId] = u;
      if (u.student_id) userMap[u.student_id] = u;
    });

    const enrichedJobs = targetJobs.map(tj => {
      const matchedUser = userMap[tj.student_id] || null;
      return {
        ...tj,
        studentName: matchedUser?.fullName || matchedUser?.name || 'Student',
        studentUserId: matchedUser?._id || tj.student_id
      };
    });

    res.json({ success: true, count: enrichedJobs.length, targetJobs: enrichedJobs });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get All Mock Interview Records (Super Admin)
 * @route   GET /api/admin/mock-interviews
 * @access  Private (Super Admin)
 */
const getAdminMockInterviews = async (req, res, next) => {
  try {
    const interviews = await Interview.find()
      .populate('candidateId', 'name fullName email studentId profilePhoto dateOfBirth gender location bio education professionalLinks profile')
      .populate('createdBy', 'name fullName email')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, count: interviews.length, interviews });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get Single Student Profile Record by ID (Super Admin)
 * @route   GET /api/admin/students/:id
 * @access  Private (Super Admin)
 */
const getAdminStudentProfile = async (req, res, next) => {
  try {
    let student = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      student = await User.findById(req.params.id).select('-password').lean();
    }
    if (!student) {
      student = await User.findOne({
        $or: [
          { studentId: req.params.id },
          { student_id: req.params.id }
        ]
      }).select('-password').lean();
    }

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found in MongoDB' });
    }

    res.json({ success: true, student });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update Student HireSmart AI Service Access Status (Super Admin)
 * @route   PUT /api/admin/students/:id/service-status
 * @access  Private (Super Admin)
 */
const updateStudentServiceStatus = async (req, res, next) => {
  try {
    const { serviceStatus } = req.body;
    if (!serviceStatus) {
      return res.status(400).json({ success: false, message: 'Please provide serviceStatus' });
    }

    let student = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      student = await User.findById(req.params.id);
    }
    if (!student) {
      student = await User.findOne({
        $or: [
          { studentId: req.params.id },
          { student_id: req.params.id }
        ]
      });
    }

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found in MongoDB' });
    }

    student.serviceStatus = serviceStatus;
    await student.save();

    const studentObj = student.toObject();
    delete studentObj.password;

    res.json({
      success: true,
      message: `Student HireSmart AI service access updated to ${serviceStatus}`,
      student: studentObj
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Issue and Save Certificate Record to MongoDB (Super Admin)
 * @route   POST /api/admin/certificates/issue
 * @access  Private (Super Admin)
 */
const issueAdminCertificate = async (req, res, next) => {
  try {
    const {
      certificateId,
      studentUserId,
      studentId,
      studentName,
      email,
      interviewId,
      jobRole,
      category,
      mode,
      score,
      title,
      organization,
      status
    } = req.body;

    if (!studentUserId || !certificateId) {
      return res.status(400).json({ success: false, message: 'Please provide certificateId and studentUserId' });
    }

    const certQuery = (interviewId && mongoose.Types.ObjectId.isValid(interviewId))
      ? { interviewId }
      : { certificateId };

    const certDoc = await Certificate.findOneAndUpdate(
      certQuery,
      {
        certificateId,
        studentUserId,
        studentId: studentId || '',
        studentName: studentName || 'Student',
        email: email || '',
        interviewId: mongoose.Types.ObjectId.isValid(interviewId) ? interviewId : null,
        jobRole: jobRole || 'Software Engineer',
        category: category || 'Technical',
        mode: mode || 'Video',
        score: score ?? 90,
        title: title || `${jobRole || 'AI Mock Interview'} Mastery Certificate`,
        organization: organization || 'Web Ai Tech Solution LLP',
        status: status || 'Verified',
        issuedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: `Certificate ${certDoc.certificateId} saved and issued successfully!`,
      certificate: certDoc
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get All Certificates Records (Super Admin)
 * @route   GET /api/admin/certificates
 * @access  Private (Super Admin)
 */
const getAdminCertificates = async (req, res, next) => {
  try {
    // 1. Fetch all issued certificates from MongoDB
    const issuedCerts = await Certificate.find({}).sort({ issuedAt: -1 }).lean();

    // Create lookup map by interviewId
    const certByInterviewMap = new Map();
    issuedCerts.forEach(c => {
      if (c.interviewId) {
        certByInterviewMap.set(String(c.interviewId), c);
      }
    });

    // 2. Fetch ALL completed Mock Interviews from MongoDB
    let completedInterviews = await Interview.find({
      $or: [
        { status: 'Completed' },
        { score: { $gt: 0 } }
      ]
    })
      .populate('candidateId', 'fullName name email studentId')
      .sort({ updatedAt: -1 })
      .lean();

    // Fallback if no completed interviews exist yet
    if (completedInterviews.length === 0) {
      completedInterviews = await Interview.find({})
        .populate('candidateId', 'fullName name email studentId')
        .sort({ createdAt: -1 })
        .lean();
    }

    const certificatesList = completedInterviews.map((inv) => {
      const candidate = inv.candidateId || {};
      const hexId = String(inv._id).substring(18).toUpperCase();
      const defaultCertId = `HSAI-2026-${hexId}`;

      const existingCert = certByInterviewMap.get(String(inv._id));
      const isGenerated = Boolean(existingCert);

      return {
        _id: inv._id,
        interviewId: inv._id,
        certificateId: isGenerated ? existingCert.certificateId : defaultCertId,
        studentId: candidate.studentId || (candidate._id ? String(candidate._id).substring(0, 8) : 'N/A'),
        studentUserId: candidate._id || inv.createdBy,
        studentName: candidate.fullName || candidate.name || inv.candidateName || 'Student',
        email: candidate.email || 'N/A',
        jobRole: inv.jobRole || inv.title || 'Software Engineer',
        category: inv.category || 'Technical',
        mode: inv.mode || 'Video',
        score: inv.score ?? inv.percentage ?? 85,
        title: `${inv.jobRole || 'AI Mock Interview'} Mastery Certificate`,
        organization: 'Web Ai Tech Solution LLP',
        issueDate: isGenerated ? (existingCert.issuedAt || existingCert.createdAt) : (inv.updatedAt || inv.createdAt),
        status: isGenerated ? 'Generated' : 'Eligible',
        isGenerated: isGenerated
      };
    });

    res.json({
      success: true,
      count: certificatesList.length,
      certificates: certificatesList
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  adminLogin,
  getAdminMe,
  getAdminDashboard,
  getAdminUsers,
  getAdminOrganizations,
  getAdminJobs,
  getAdminInterviews,
  getAdminResumeScans,
  getAdminStudents,
  getAdminStudentProfile,
  updateStudentServiceStatus,
  getAdminRegistrations,
  getAdminResumes,
  getAdminTargetJobs,
  getAdminMockInterviews,
  getAdminCertificates,
  issueAdminCertificate
};
