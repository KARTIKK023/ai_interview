import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentInterviews from './pages/student/StudentInterviews';
import StudentInterviewQuestions from './pages/student/StudentInterviewQuestions';
import TextInterview from './pages/student/TextInterview';
import VideoInterview from './pages/student/VideoInterview';
import InterviewReport from './pages/student/InterviewReport';
import StudentAnalytics from './pages/student/StudentAnalytics';
import StudentProfile from './pages/student/StudentProfile';
import ProfileProgress from './pages/student/ProfileProgress';
import StudentResume from './pages/student/StudentResume';
import StudentTargetJobs from './pages/student/StudentTargetJobs';
import AtsScanner from './pages/student/AtsScanner';
import StudentAchievements from './pages/student/StudentAchievements';
import PlacementOpportunities from './pages/student/PlacementOpportunities';
import HelpSupport from './pages/student/HelpSupport';

// Interview Preparation Pages
import AIMockInterviewLevels from './pages/student/interview-preparation/AIMockInterviewLevels';
import AIMockInterview from './pages/student/interview-preparation/AIMockInterview';
import QuickPractice from './pages/student/interview-preparation/QuickPractice';

// Student Question Bank Pages
import QuestionBankReader from './pages/student/QuestionBankReader';

// Super Admin Components & Pages
import SuperAdminLogin from './pages/super-admin/SuperAdminLogin';
import SuperAdminLayout from './components/SuperAdminLayout';
import SuperAdminDashboard from './pages/super-admin/SuperAdminDashboard';
import SuperAdminUsers from './pages/super-admin/SuperAdminUsers';
import SuperAdminOrganizations from './pages/super-admin/SuperAdminOrganizations';
import SuperAdminJobs from './pages/super-admin/SuperAdminJobs';
import SuperAdminInterviews from './pages/super-admin/SuperAdminInterviews';
import SuperAdminResumeScans from './pages/super-admin/SuperAdminResumeScans';
import SuperAdminStudents from './pages/super-admin/SuperAdminStudents';
import SuperAdminRegistrations from './pages/super-admin/SuperAdminRegistrations';
import SuperAdminResumes from './pages/super-admin/SuperAdminResumes';
import SuperAdminTargetJobs from './pages/super-admin/SuperAdminTargetJobs';
import SuperAdminMockInterviews from './pages/super-admin/SuperAdminMockInterviews';
import SuperAdminCertificates from './pages/super-admin/SuperAdminCertificates';
import AdminProtectedRoute from './components/AdminProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Super Admin Routes */}
      <Route path="/super-admin/login" element={<SuperAdminLogin />} />
      <Route
        path="/super-admin/dashboard"
        element={
          <AdminProtectedRoute>
            <SuperAdminDashboard />
          </AdminProtectedRoute>
        }
      />

      {/* Super Admin Layout Sub-Routes */}
      <Route
        element={
          <AdminProtectedRoute>
            <SuperAdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route path="/super-admin/students" element={<SuperAdminStudents />} />
        <Route path="/super-admin/registrations" element={<SuperAdminRegistrations />} />
        <Route path="/super-admin/resumes" element={<SuperAdminResumes />} />
        <Route path="/super-admin/target-jobs" element={<SuperAdminTargetJobs />} />
        <Route path="/super-admin/mock-interviews" element={<SuperAdminMockInterviews />} />
        <Route path="/super-admin/certificates" element={<SuperAdminCertificates />} />

        {/* Additional Super Admin Resource Routes */}
        <Route path="/super-admin/users" element={<SuperAdminUsers />} />
        <Route path="/super-admin/organizations" element={<SuperAdminOrganizations />} />
        <Route path="/super-admin/jobs-companies" element={<SuperAdminJobs />} />
        <Route path="/super-admin/ai-interview-engine" element={<SuperAdminInterviews />} />
        <Route path="/super-admin/resume-scans" element={<SuperAdminResumeScans />} />
      </Route>

      {/* Student Routes */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/interviews"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentInterviews />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/student/interviews/:id/questions"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentInterviewQuestions />
          </ProtectedRoute>
        }
      />
    
      <Route
        path="/student/interview-text/:id"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <TextInterview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/interview-video/:id"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <VideoInterview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/result/:id"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <InterviewReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/analytics"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/profile"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/profile-progress"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <ProfileProgress />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/resume"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentResume />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/target-jobs"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentTargetJobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/ats-scanner"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <AtsScanner />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/achievements"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentAchievements />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/placement-opportunities"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <PlacementOpportunities />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/help-support"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <HelpSupport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/interview-preparation/ai-mock"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <AIMockInterviewLevels />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/interview-preparation/ai-mock/setup"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <AIMockInterview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/interview-preparation/quick-practice"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <QuickPractice />
          </ProtectedRoute>
        }
      />

      {/* Student Question Bank Routes */}
      <Route
        path="/student/question-bank-reader"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <QuestionBankReader />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/question-bank"
        element={<Navigate to="/student/question-bank-reader" replace />}
      />


      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
