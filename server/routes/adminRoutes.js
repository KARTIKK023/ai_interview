const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { protectAdmin } = require('../middleware/adminMiddleware');

// Super Admin Public Auth Endpoint
router.post('/login', adminLogin);

// Super Admin Protected Session Endpoint
router.get('/me', protectAdmin, getAdminMe);

// Super Admin Protected Real Dashboard Analytics Endpoint
router.get('/dashboard', protectAdmin, getAdminDashboard);

// Super Admin Protected Resource Management Endpoints
router.get('/users', protectAdmin, getAdminUsers);
router.get('/organizations', protectAdmin, getAdminOrganizations);
router.get('/jobs', protectAdmin, getAdminJobs);
router.get('/interviews', protectAdmin, getAdminInterviews);
router.get('/resume-scans', protectAdmin, getAdminResumeScans);

// Exact Requested Super Admin Endpoints
router.get('/students', protectAdmin, getAdminStudents);
router.get('/students/:id', protectAdmin, getAdminStudentProfile);
router.put('/students/:id/service-status', protectAdmin, updateStudentServiceStatus);
router.get('/registrations', protectAdmin, getAdminRegistrations);
router.get('/resumes', protectAdmin, getAdminResumes);
router.get('/target-jobs', protectAdmin, getAdminTargetJobs);
router.get('/mock-interviews', protectAdmin, getAdminMockInterviews);
router.get('/certificates', protectAdmin, getAdminCertificates);
router.post('/certificates/issue', protectAdmin, issueAdminCertificate);

module.exports = router;
