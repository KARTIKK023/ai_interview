import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';
import StatCard from '../../components/StatCard';
import InterviewCard from '../../components/InterviewCard';
import API from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { FaPlay, FaHistory, FaTachometerAlt, FaStar, FaCheckCircle, FaExclamationCircle, FaVideo, FaFont, FaFileAlt, FaUserEdit } from 'react-icons/fa';
import { TbScan } from 'react-icons/tb';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalInterviews: 0,
    practiceCount: 0,
    hrCount: 0,
    averageScore: 0,
    bestScore: 0
  });
  const [recentInterviews, setRecentInterviews] = useState([]);
  const [profileProgress, setProfileProgress] = useState({
    progress: 0,
    completedWeight: 0,
    remainingWeight: 100
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, interviewsRes, progressRes] = await Promise.all([
        API.get('/analytics/student').catch(() => ({ data: {} })),
        API.get('/interviews').catch(() => ({ data: {} })),
        API.get('/profile/progress').catch(() => ({ data: { success: false } }))
      ]);

      if (analyticsRes?.data?.analytics) {
        setStats(analyticsRes.data.analytics);
      }
      if (interviewsRes?.data?.interviews) {
        setRecentInterviews(interviewsRes.data.interviews.slice(0, 4));
      }
      if (progressRes?.data && progressRes.data.success) {
        setProfileProgress(progressRes.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudentLayout>
      {/* DASHBOARD HEADER */}
      <div
        className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center p-4 mb-4 gap-3"
        style={{
          background: 'linear-gradient(135deg, #F5F7FF 0%, #EEF4FF 100%)',
          borderRadius: '18px',
          border: '1px solid rgba(79, 70, 229, 0.15)',
          boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
        }}
      >
        <div>
          <div className="d-flex align-items-center gap-2.5 mb-1">
            <h3
              className="fw-extrabold mb-0"
              style={{
                background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
                fontSize: '1.75rem',
                letterSpacing: '-0.02em'
              }}
            >
              Candidate Dashboard
            </h3>
            <span
              className="badge rounded-pill px-2.5 py-1 fw-bold"
              style={{
                backgroundColor: 'rgba(124, 58, 237, 0.12)',
                color: '#7C3AED',
                border: '1px solid rgba(124, 58, 237, 0.25)',
                fontSize: '0.7rem'
              }}
            >
              AI Candidate Hub
            </span>
          </div>
          <p className="mb-0 small" style={{ color: '#64748B', fontSize: '0.875rem' }}>
            Welcome back, {user?.name || user?.fullName || 'Candidate'}. Track your AI practice progress.
          </p>
        </div>

        <Link
          to="/student/ats-scanner"
          className="btn btn-primary-custom d-flex align-items-center gap-2 shadow-sm text-nowrap"
          style={{
            backgroundColor: '#4F46E5',
            borderColor: '#4F46E5',
            borderRadius: '10px',
            padding: '10px 18px',
            fontSize: '0.875rem'
          }}
        >
          <TbScan size={18} /> ATS Resume Checker
        </Link>
      </div>

      {/* STAT CARDS ROW */}
      <div className="row g-3 mb-4">
        <div className="col-xl-3 col-md-6">
          <StatCard
            title="Profile Progress"
            value={`${profileProgress.progress}%`}
            icon={FaUserEdit}
            color="purple"
            actionLink="/student/profile-progress"
            actionTitle="Profile Progress"
          >
            <div className="progress mt-2" style={{ height: '6px', borderRadius: '3px', backgroundColor: 'rgba(168, 85, 247, 0.2)' }}>
              <div
                className="progress-bar progress-bar-striped progress-bar-animated"
                role="progressbar"
                style={{ width: `${profileProgress.progress}%`, backgroundColor: '#8b5cf6' }}
                aria-valuenow={profileProgress.progress}
                aria-valuemin="0"
                aria-valuemax="100"
              />
            </div>
          </StatCard>
        </div>
        <div className="col-xl-3 col-md-6">
          <StatCard title="Average Score" value={`${stats.averageScore || 0}%`} icon={FaStar} color="warning" />
        </div>
        <div className="col-xl-3 col-md-6">
          <StatCard title="Best Score" value={`${stats.bestScore || 0}%`} icon={FaCheckCircle} color="success" />
        </div>
        <div className="col-xl-3 col-md-6">
          <StatCard title="Total Interviews" value={stats.totalInterviews || 0} icon={FaTachometerAlt} color="primary" />
        </div>
      </div>

      {/* RECENT INTERVIEWS GRID SECTION */}
      <div
        className="p-4 mb-4 flex-grow-1"
        style={{
          background: 'linear-gradient(135deg, #F8FAFF 0%, #EEF4FF 100%)',
          borderRadius: '20px',
          border: '1px solid rgba(99, 102, 241, 0.15)',
          boxShadow: '0 12px 32px -10px rgba(99, 102, 241, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4
            className="fw-extrabold mb-0"
            style={{
              background: 'linear-gradient(135deg, #1D4ED8 0%, #7C3AED 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
              fontSize: '1.4rem',
              letterSpacing: '-0.01em'
            }}
          >
            Recent Interview Sessions
          </h4>
          <Link to="/student/interviews" className="text-primary small fw-semibold">View All History →</Link>
        </div>

        {recentInterviews.length === 0 ? (
          <div className="card card-custom p-5 text-center bg-white border-0 shadow-sm">
            <p className="text-muted mb-3">No interview sessions found yet.</p>
            <Link to="/student/interview-preparation/ai-mock" className="btn btn-outline-primary btn-sm mx-auto">Start Your First Practice Session</Link>
          </div>
        ) : (
          <div className="row g-3">
            {recentInterviews.map((item, index) => (
              <div key={item._id || index} className="col-xl-3 col-md-6">
                <InterviewCard interview={item} index={index} />
              </div>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;
