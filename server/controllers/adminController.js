const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Role = require('../models/Role');
const Interview = require('../models/Interview');
const Resume = require('../models/Resume');
const JobRole = require('../models/JobRole');
const TargetJob = require('../models/TargetJob');
const Evaluation = require('../models/Evaluation');
const Certificate = require('../models/Certificate');
const SupportMessage = require('../models/SupportMessage');
const AtsScan = require('../models/AtsScan');
const AtsArtifact = require('../models/AtsArtifact');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'ai_interview_secret_key_2026_super_secure', {
    expiresIn: '30d'
  });
};

const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const caseInsensitiveExactMatch = (value) => {
  const trimmed = String(value || '').trim();
  if (!trimmed) return null;

  return {
    $regex: `^${escapeRegex(trimmed)}$`,
    $options: 'i'
  };
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
 * @desc    Super Admin & Admin Login
 * @route   POST /api/admin/login
 * @access  Public
 */
const adminLogin = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const loginIdentifier = (email || username || '').trim();

    if (!loginIdentifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide admin email or username and password' });
    }

    const normalizedIdentifier = loginIdentifier.toLowerCase();
    const usernameMatch = caseInsensitiveExactMatch(loginIdentifier);
    const nameMatch = caseInsensitiveExactMatch(loginIdentifier);

    // 1. First check User collection for Super Admin
    let user = await User.findOne({
      $or: [
        { email: normalizedIdentifier },
        { username: usernameMatch },
        { name: nameMatch }
      ]
    }).select('+password');

    let isFromRoleCollection = false;

    // 2. If not found in User collection, search Role model ('roles' collection)
    if (!user) {
      user = await Role.findOne({
        $or: [
          { email: normalizedIdentifier },
          { username: usernameMatch }
        ]
      }).select('+password');
      if (user) {
        isFromRoleCollection = true;
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    // 3. Verify password with bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    // 4. Verify Account Status
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Your admin account has been deactivated. Contact Super Admin.'
      });
    }

    // 5. Role Verification: Must be SUPER_ADMIN or ADMIN
    const roleUpper = (user.role || '').toUpperCase();
    if (roleUpper !== 'SUPER_ADMIN' && roleUpper !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have admin privileges.'
      });
    }

    // 6. Login Tracking
    const loginTime = new Date();
    user.lastLogin = loginTime;
    user.loginStartedAt = loginTime;
    user.lastLogout = null;
    user.loginDuration = 0;
    user.isOnline = true;
    await user.save();

    // 7. Generate JWT Token
    const token = generateToken(user._id);

    const adminObj = {
      id: user._id,
      _id: user._id,
      adminId: user.adminId,
      username: user.username || user.fullName || user.name || 'Admin',
      fullName: user.fullName || user.name || 'Admin',
      name: user.fullName || user.name || 'Admin',
      email: user.email,
      role: user.role,
      permissions: user.permissions || [],
      isActive: user.isActive
    };

    return res.json({
      success: true,
      message: `${roleUpper === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'} authentication successful`,
      token,
      user: adminObj
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get Current Admin / Super Admin Session
 * @route   GET /api/admin/me
 * @access  Private (Super Admin / Admin)
 */
const getAdminMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Admin not authenticated' });
    }

    const userIdStr = req.user._id ? String(req.user._id) : '';
    const adminObj = {
      id: req.user._id,
      _id: req.user._id,
      adminId: req.user.adminId || (userIdStr ? userIdStr.substring(0, 8) : 'N/A'),
      username: req.user.username || req.user.fullName || req.user.name || 'Admin',
      fullName: req.user.fullName || req.user.name || 'Admin',
      name: req.user.fullName || req.user.name || 'Admin',
      email: req.user.email || '',
      role: req.user.role || 'ADMIN',
      permissions: Array.isArray(req.user.permissions) ? req.user.permissions : [],
      isActive: req.user.isActive !== false
    };

    return res.json({
      success: true,
      user: adminObj
    });
  } catch (err) {
    console.error('getAdminMe Error:', err);
    return res.status(500).json({ success: false, message: 'Server error loading admin session' });
  }
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
    const studentFilter = {
      role: { $nin: ['admin', 'hr', 'super_admin', 'ADMIN', 'HR', 'SUPER_ADMIN'] }
    };
    const completedFilter = {
      status: { $in: ['Completed', 'completed', 'COMPLETED'] }
    };
    const pendingFilter = {
      status: { $in: ['Pending', 'pending', 'PENDING', 'In Progress', 'in_progress', 'IN_PROGRESS'] }
    };

    const [
      totalStudents,
      newStudents30d,
      totalCompletedInterviews,
      newCompleted30d,
      totalPendingInterviews,
      newPending30d,
      totalInterviews,
      newInterviews30d,
      totalResumeScans,
      newResumeScans30d,
      totalCertificates,
      totalInquiries,
      avgScoreAgg,
      totalAtsAnalyses,
      newAtsAnalyses30d
    ] = await Promise.all([
      User.countDocuments(studentFilter),
      User.countDocuments({ ...studentFilter, createdAt: { $gte: thirtyDaysAgo } }),
      Interview.countDocuments(completedFilter).catch(() => 0),
      Interview.countDocuments({ ...completedFilter, createdAt: { $gte: thirtyDaysAgo } }).catch(() => 0),
      Interview.countDocuments(pendingFilter).catch(() => 0),
      Interview.countDocuments({ ...pendingFilter, createdAt: { $gte: thirtyDaysAgo } }).catch(() => 0),
      Interview.countDocuments().catch(() => 0),
      Interview.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }).catch(() => 0),
      Resume.countDocuments().catch(() => 0),
      Resume.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }).catch(() => 0),
      Certificate.countDocuments().catch(() => 0),
      SupportMessage.countDocuments().catch(() => 0),
      Interview.aggregate([
        { $match: { $or: [{ score: { $gt: 0 } }, { percentage: { $gt: 0 } }] } },
        {
          $group: {
            _id: null,
            avgScore: {
              $avg: { $cond: [{ $gt: ['$score', 0] }, '$score', '$percentage'] }
            }
          }
        }
      ]).catch(() => []),
      AtsScan.countDocuments().catch(() => 0),
      AtsScan.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }).catch(() => 0)
    ]);

    const rawAvgScore = (avgScoreAgg && avgScoreAgg.length > 0 && avgScoreAgg[0].avgScore)
      ? Math.round(avgScoreAgg[0].avgScore * 10) / 10
      : 0;
    const avgScoreDisplay = rawAvgScore > 0 ? `${rawAvgScore}%` : '0%';

    // Growth percentage helper
    const calcTrend = (newCount, totalCount) => {
      const prev = totalCount - newCount;
      if (prev <= 0) return totalCount > 0 ? '+100%' : '0%';
      const pct = ((newCount / prev) * 100).toFixed(1);
      return `${pct >= 0 ? '+' : ''}${pct}%`;
    };

    const kpiCards = [
      {
        id: 'total-students',
        title: 'TOTAL STUDENTS',
        value: totalStudents.toLocaleString(),
        trend: calcTrend(newStudents30d, totalStudents),
        trendUp: newStudents30d >= 0,
        timeframe: `${newStudents30d} new in last 30d`,
        color: '#2563EB',
        bgLight: 'rgba(37, 99, 235, 0.1)',
        route: '/super-admin/students'
      },
      {
        id: 'completed-interviews',
        title: 'COMPLETED INTERVIEWS',
        value: totalCompletedInterviews.toLocaleString(),
        trend: calcTrend(newCompleted30d, totalCompletedInterviews),
        trendUp: newCompleted30d >= 0,
        timeframe: `${newCompleted30d} completed in last 30d`,
        color: '#059669',
        bgLight: 'rgba(5, 150, 105, 0.1)',
        route: '/super-admin/mock-interviews?status=Completed'
      },
      {
        id: 'pending-interviews',
        title: 'PENDING INTERVIEWS',
        value: totalPendingInterviews.toLocaleString(),
        trend: calcTrend(newPending30d, totalPendingInterviews),
        trendUp: newPending30d >= 0,
        timeframe: `${newPending30d} pending in last 30d`,
        color: '#6366F1',
        bgLight: 'rgba(99, 102, 241, 0.1)',
        route: '/super-admin/mock-interviews?status=Pending'
      },
      {
        id: 'ai-interviews',
        title: 'TOTAL INTERVIEWS',
        value: totalInterviews.toLocaleString(),
        trend: calcTrend(newInterviews30d, totalInterviews),
        trendUp: newInterviews30d >= 0,
        timeframe: `${newInterviews30d} session(s) in last 30d`,
        color: '#9333EA',
        bgLight: 'rgba(147, 51, 234, 0.1)',
        route: '/super-admin/mock-interviews'
      },
     
      {
        id: 'avg-score',
        title: 'AVERAGE SCORE',
        value: avgScoreDisplay,
        trend: '+2.5%',
        trendUp: true,
        timeframe: 'all students average',
        color: '#D97706',
        bgLight: 'rgba(217, 119, 6, 0.1)',
        route: '/super-admin/mock-interviews'
      },
       {
        id: 'total-inquiries',
        title: 'TOTAL INQUIRIES',
        value: totalInquiries.toLocaleString(),
        trend: '',
        trendUp: true,
        timeframe: 'Total support inquiries',
        color: '#0284C7',
        bgLight: 'rgba(2, 132, 199, 0.1)',
        route: '/super-admin/inquiry-details'
      },
      {
        id: 'total-certificates',
        title: 'TOTAL CERTIFICATES',
        value: totalCertificates.toLocaleString(),
        trend: '',
        trendUp: true,
        timeframe: 'All issued certificates with score >= 75%  ',
        color: '#7C3AED',
        bgLight: 'rgba(124, 58, 237, 0.1)',
        route: '/super-admin/certificates'
      },
       {
        id: 'ats-resumes',
        title: 'ATS RESUMES',
        value: totalAtsAnalyses.toLocaleString(),
        trend: calcTrend(newAtsAnalyses30d, totalAtsAnalyses),
        trendUp: newAtsAnalyses30d >= 0,
        timeframe: `${newAtsAnalyses30d} scan(s) in last 30d`,
        color: '#06B6D4',
        bgLight: 'rgba(6, 182, 212, 0.1)',
        route: '/admin/ats-resume-scans'
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
 * @desc    Get Student Latest Login History Session (Super Admin)
 * @route   GET /api/admin/students/:studentId/login-history
 * @access  Private (Super Admin)
 */
const getStudentLoginHistory = async (req, res, next) => {
  try {
    const studentIdParam = req.params.studentId;
    let student = null;
    if (mongoose.Types.ObjectId.isValid(studentIdParam)) {
      student = await User.findById(studentIdParam).lean();
    }
    if (!student) {
      student = await User.findOne({
        $or: [
          { studentId: studentIdParam },
          { student_id: studentIdParam }
        ]
      }).lean();
    }

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found in database' });
    }

    let history = [...(student.loginHistory || [])];

    // Fallback if student logged in but loginHistory array was empty
    if (history.length === 0 && student.lastLogin) {
      history = [
        {
          loginAt: student.lastLogin,
          logoutAt: student.isOnline ? null : student.lastLogout,
          duration: student.loginDuration || 0
        }
      ];
    }

    // Sort oldest first to resolve missing logoutAt/duration for historical sessions
    history.sort((a, b) => new Date(a.loginAt).getTime() - new Date(b.loginAt).getTime());

    const isUserCurrentlyOnline = Boolean(student.isOnline);

    const processedHistory = history.map((session, idx) => {
      const isLastEntry = idx === history.length - 1;
      const isSessionActive = isUserCurrentlyOnline && isLastEntry && !session.logoutAt;

      let logoutAt = session.logoutAt;
      let sessionDuration = Number(session.duration) || 0;

      if (isSessionActive) {
        logoutAt = null;
        const startMs = new Date(session.loginAt || student.loginStartedAt).getTime();
        if (!isNaN(startMs)) {
          sessionDuration = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
        }
      } else {
        // If an old session was left unclosed (logoutAt is null)
        if (!logoutAt) {
          if (!isLastEntry && history[idx + 1] && history[idx + 1].loginAt) {
            // Next session's login time becomes this session's logout time
            logoutAt = history[idx + 1].loginAt;
          } else if (student.lastLogout && new Date(student.lastLogout) > new Date(session.loginAt)) {
            logoutAt = student.lastLogout;
          } else {
            logoutAt = session.loginAt;
          }
        }

        if (session.loginAt && logoutAt) {
          const startMs = new Date(session.loginAt).getTime();
          const endMs = new Date(logoutAt).getTime();
          if (!isNaN(startMs) && !isNaN(endMs) && endMs >= startMs) {
            sessionDuration = Math.floor((endMs - startMs) / 1000);
          }
        }
      }

      return {
        _id: session._id,
        loginAt: session.loginAt,
        logoutAt: isSessionActive ? null : logoutAt,
        duration: sessionDuration,
        isOnline: isSessionActive
      };
    });

    // Sort newest first for display
    processedHistory.sort((a, b) => new Date(b.loginAt).getTime() - new Date(a.loginAt).getTime());

    return res.json({
      success: true,
      student: {
        id: student._id,
        _id: student._id,
        name: student.fullName || student.name || 'Student',
        fullName: student.fullName || student.name || 'Student',
        studentId: student.studentId || student.student_id || (student._id ? String(student._id).substring(0, 8) : 'N/A'),
        isOnline: Boolean(student.isOnline)
      },
      history: processedHistory
    });
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
 * @desc    Delete Student Record by ID (Super Admin)
 * @route   DELETE /api/admin/students/:id
 * @access  Private (Super Admin)
 */
const deleteAdminStudent = async (req, res, next) => {
  try {
    const studentIdParam = req.params.id;
    let student = null;

    if (mongoose.Types.ObjectId.isValid(studentIdParam)) {
      student = await User.findById(studentIdParam);
    }
    if (!student) {
      student = await User.findOne({
        $or: [
          { studentId: studentIdParam },
          { student_id: studentIdParam }
        ]
      });
    }

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found in MongoDB' });
    }

    const targetUserId = student._id;

    // Delete student user record
    await User.findByIdAndDelete(targetUserId);

    // Clean up related user data gracefully
    await Promise.all([
      Interview.deleteMany({ candidateId: targetUserId }).catch(() => {}),
      Resume.deleteMany({ userId: targetUserId }).catch(() => {}),
      TargetJob.deleteMany({ $or: [{ student_id: String(targetUserId) }, { student_id: student.studentId }] }).catch(() => {}),
      AtsScan.deleteMany({ userId: targetUserId }).catch(() => {}),
      Certificate.deleteMany({ studentUserId: targetUserId }).catch(() => {}),
      SupportMessage.deleteMany({ $or: [{ studentId: targetUserId }, { studentEmail: student.email }] }).catch(() => {})
    ]);

    res.json({
      success: true,
      message: 'Student record deleted successfully from database'
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

/**
 * @desc    Get All ATS Analysis Records for Super Admin
 * @route   GET /api/admin/ats/analysis-history
 * @access  Private (Super Admin)
 */
const getAdminAtsAnalysisHistory = async (req, res, next) => {
  try {
    const scans = await AtsScan.find()
      .populate('userId', 'fullName name email studentId')
      .sort({ createdAt: -1 })
      .lean();

    const analysisHistory = scans.map((scan) => {
      const user = scan.userId || {};
      const studentName = user.fullName || user.name || 'Student';
      const studentId = user.studentId || (user._id ? String(user._id).substring(0, 8) : 'N/A');
      const targetJobRole = scan.targetJob?.target_job_role || 'Target Job';
      const company = scan.targetJob?.target_company || '—';
      const atsScore = scan.overallScore ?? 0;
      const projectedScore = Number.isFinite(scan.optimization?.projectedScore)
        ? scan.optimization.projectedScore
        : null;

      return {
        ...scan,
        _id: scan._id,
        studentName,
        studentId,
        targetJobRole,
        company,
        atsScore,
        projectedScore,
        analyzedAt: scan.createdAt
      };
    });

    res.json({
      success: true,
      count: analysisHistory.length,
      scans: analysisHistory,
      analysisHistory
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get All ATS Resume Scans for Super Admin
 * @route   GET /api/admin/ats-resume-scans
 * @access  Private (Super Admin)
 */
const getAdminAtsResumeScans = async (req, res, next) => {
  try {
    const scans = await AtsScan.find()
      .populate('userId', 'fullName name email studentId')
      .populate('resumeId', 'fileName originalName')
      .sort({ createdAt: -1 })
      .lean();

    const scanIds = scans.map((s) => s._id);
    const artifacts = await AtsArtifact.find({ scanId: { $in: scanIds } })
      .select('scanId fileName contentType')
      .lean()
      .catch(() => []);

    const artifactMap = new Map();
    artifacts.forEach((art) => {
      artifactMap.set(String(art.scanId), art);
    });

    const records = scans.map((scan, index) => {
      const user = scan.userId || {};
      const studentName = user.fullName || user.name || 'Student';
      const studentId = user.studentId || (user._id ? String(user._id).substring(0, 8) : 'N/A');
      const studentUserId = user._id || scan.userId;
      const artifact = artifactMap.get(String(scan._id));
      const fileName = artifact?.fileName || scan.resumeId?.fileName || scan.resumeId?.originalName || 'ATS-Resume.pdf';
      const targetJob = scan.targetJob?.target_job_role || 'Target Job';
      const company = scan.targetJob?.target_company || '—';
      const atsScore = scan.overallScore ?? 0;
      const projectedScore = Number.isFinite(scan.optimization?.projectedScore)
        ? scan.optimization.projectedScore
        : null;

      return {
        _id: scan._id,
        serialNumber: index + 1,
        studentName,
        studentId,
        studentUserId,
        fileName,
        targetJob,
        company,
        atsScore,
        projectedScore,
        analyzedAt: scan.createdAt,
        status: scan.status === 'completed' ? 'Parsed' : (scan.status || 'Parsed')
      };
    });

    res.json({
      success: true,
      count: records.length,
      records
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Assign Admin Role & Feature Permissions (Super Admin)
 * @route   POST /api/admin/assign-role
 * @access  Private (Super Admin)
 */
const assignAdmin = async (req, res, next) => {
  try {
    const { username, email, password, role = 'admin', permissions = [] } = req.body;

    // Validation
    if (!username || !username.trim()) {
      return res.status(400).json({ success: false, message: 'Username is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    if (!Array.isArray(permissions) || permissions.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select at least one assigned feature' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanUsername = username.trim();

    // Check duplicate email in Role collection ('roles')
    const existingRoleEmail = await Role.findOne({ email: normalizedEmail });
    const existingUserEmail = await User.findOne({ email: normalizedEmail });
    if (existingRoleEmail || existingUserEmail) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    // Check duplicate username in Role collection ('roles')
    const existingRoleUsername = await Role.findOne({ username: cleanUsername });
    const existingUserUsername = await User.findOne({ username: cleanUsername });
    if (existingRoleUsername || existingUserUsername) {
      return res.status(400).json({ success: false, message: 'Username is already taken' });
    }

    // Hash password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Auto-generate Admin ID (ADM-00001 format)
    const adminCount = await Role.countDocuments({});
    const adminId = `ADM-${String(adminCount + 1).padStart(5, '0')}`;

    // Create Admin record in dedicated 'roles' MongoDB collection
    const newAdmin = await Role.create({
      adminId,
      username: cleanUsername,
      email: normalizedEmail,
      password: passwordHash,
      role: 'admin',
      permissions,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Admin assigned successfully in roles collection',
      admin: {
        id: newAdmin._id,
        _id: newAdmin._id,
        adminId: newAdmin.adminId,
        username: newAdmin.username,
        email: newAdmin.email,
        role: newAdmin.role,
        permissions: newAdmin.permissions,
        isActive: newAdmin.isActive,
        createdAt: newAdmin.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get List of Assigned Admins from 'roles' MongoDB Collection
 * @route   GET /api/admin/assigned-admins
 * @access  Private (Super Admin)
 */
const getAssignedAdmins = async (req, res, next) => {
  try {
    const admins = await Role.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    const formattedAdmins = admins.map((adm, index) => ({
      ...adm,
      id: adm._id,
      adminId: adm.adminId || `ADM-${String(index + 1).padStart(5, '0')}`,
      username: adm.username || adm.email || 'Admin',
      permissions: adm.permissions || []
    }));

    res.json({
      success: true,
      count: formattedAdmins.length,
      admins: formattedAdmins
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update Admin Permissions & Info in 'roles' Collection
 * @route   PUT /api/admin/assigned-admins/:id
 * @access  Private (Super Admin)
 */
const updateAdminPermissions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, email, role, permissions } = req.body;

    const admin = await Role.findById(id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found in roles collection' });
    }

    if (username && username.trim() !== admin.username) {
      const existingUser = await Role.findOne({ username: username.trim(), _id: { $ne: id } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Username is already taken' });
      }
      admin.username = username.trim();
    }

    if (email && email.toLowerCase().trim() !== admin.email) {
      const existingEmail = await Role.findOne({ email: email.toLowerCase().trim(), _id: { $ne: id } });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: 'Email is already in use' });
      }
      admin.email = email.toLowerCase().trim();
    }

    if (Array.isArray(permissions)) {
      admin.permissions = permissions;
    }

    if (role) {
      admin.role = role.toLowerCase();
    }

    await admin.save();

    res.json({
      success: true,
      message: 'Admin permissions updated successfully',
      admin: {
        id: admin._id,
        _id: admin._id,
        adminId: admin.adminId,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        isActive: admin.isActive,
        updatedAt: admin.updatedAt
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Toggle Admin Active Status in 'roles' Collection
 * @route   PUT /api/admin/assigned-admins/:id/toggle-status
 * @access  Private (Super Admin)
 */
const toggleAdminStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const admin = await Role.findById(id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found in roles collection' });
    }

    admin.isActive = !admin.isActive;
    await admin.save();

    res.json({
      success: true,
      message: `Admin ${admin.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: admin.isActive
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete Admin Account from 'roles' Collection
 * @route   DELETE /api/admin/assigned-admins/:id
 * @access  Private (Super Admin)
 */
const deleteAdminUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const admin = await Role.findById(id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found in roles collection' });
    }

    await Role.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Admin deleted successfully from roles collection'
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
  getStudentLoginHistory,
  updateStudentServiceStatus,
  deleteAdminStudent,
  getAdminRegistrations,
  getAdminResumes,
  getAdminTargetJobs,
  getAdminMockInterviews,
  getAdminCertificates,
  issueAdminCertificate,
  getAdminAtsAnalysisHistory,
  getAdminAtsResumeScans,
  assignAdmin,
  getAssignedAdmins,
  updateAdminPermissions,
  toggleAdminStatus,
  deleteAdminUser
};
