const express = require('express');
const router = express.Router();
const {
  adminLogin,
  getAdminMe,
  getSuperAdminProfile,
  updateSuperAdminProfile,
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
} = require('../controllers/adminController');
const { protectAdmin, protectSuperAdmin } = require('../middleware/adminMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const { downloadOptimizedResume } = require('../controllers/atsController');

// Super Admin / Admin Auth Endpoints
router.post('/login', adminLogin);
router.get('/me', protectAdmin, getAdminMe);
router.get('/profile', protectSuperAdmin, getSuperAdminProfile);
router.put('/profile', protectSuperAdmin, updateSuperAdminProfile);

// Assign Role Management Endpoints (Strictly Super Admin)
router.post('/assign-role', protectSuperAdmin, assignAdmin);
router.get('/assigned-admins', protectSuperAdmin, getAssignedAdmins);
router.put('/assigned-admins/:id', protectSuperAdmin, updateAdminPermissions);
router.put('/assigned-admins/:id/toggle-status', protectSuperAdmin, toggleAdminStatus);
router.delete('/assigned-admins/:id', protectSuperAdmin, deleteAdminUser);

// Protected Feature Routes with Permission Middleware
router.get('/dashboard', protectAdmin, requirePermission('dashboard'), getAdminDashboard);
router.get('/users', protectAdmin, requirePermission('students'), getAdminUsers);
router.get('/organizations', protectAdmin, requirePermission('students'), getAdminOrganizations);
router.get('/jobs', protectAdmin, requirePermission('target-jobs'), getAdminJobs);
router.get('/interviews', protectAdmin, requirePermission('mock-interviews'), getAdminInterviews);
router.get('/resume-scans', protectAdmin, requirePermission('resumes'), getAdminResumeScans);

// Permission Enforced Specific Endpoints
router.get('/students', protectAdmin, requirePermission('students'), getAdminStudents);
router.get('/students/:studentId/login-history', protectAdmin, requirePermission('students'), getStudentLoginHistory);
router.get('/students/:id', protectAdmin, requirePermission('students'), getAdminStudentProfile);
router.put('/students/:id/service-status', protectAdmin, requirePermission('students'), updateStudentServiceStatus);
router.delete('/students/:id', protectAdmin, requirePermission('students'), deleteAdminStudent);
router.get('/registrations', protectAdmin, requirePermission('registrations'), getAdminRegistrations);
router.get('/resumes', protectAdmin, requirePermission('resumes'), getAdminResumes);
router.get('/target-jobs', protectAdmin, requirePermission('target-jobs'), getAdminTargetJobs);
router.get('/mock-interviews', protectAdmin, requirePermission('mock-interviews'), getAdminMockInterviews);
router.get('/certificates', protectAdmin, requirePermission('certificates'), getAdminCertificates);
router.post('/certificates/issue', protectAdmin, requirePermission('certificates'), issueAdminCertificate);
router.get('/ats/analysis-history', protectAdmin, requirePermission('ats-analysis'), getAdminAtsAnalysisHistory);
router.get('/ats-resume-scans', protectAdmin, requirePermission('ats-analysis'), getAdminAtsResumeScans);
router.get('/ats/scans/:id/optimized-resume', protectAdmin, requirePermission('resumes'), downloadOptimizedResume);

module.exports = router;
