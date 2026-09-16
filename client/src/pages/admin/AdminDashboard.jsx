import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBars,
  FaShieldAlt,
  FaChevronDown,
  FaUserFriends,
  FaUserPlus,
  FaFileAlt,
  FaBriefcase,
  FaBrain,
  FaAward,
  FaClipboardList,
  FaChartLine,
  FaArrowRight,
  FaChevronRight
} from 'react-icons/fa';
import AdminSidebar from './AdminSidebar';
import API from '../../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
      const meRes = await API.get('/admin/me');
      if (meRes.data && meRes.data.success) {
        setAdminUser(meRes.data.user);
        localStorage.setItem('adminUser', JSON.stringify(meRes.data.user));
      }
    } catch (err) {
      console.error('Failed to load admin profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const permissions = adminUser?.permissions || [];
  const isSuperAdmin = (adminUser?.role || '').toUpperCase() === 'SUPER_ADMIN';

  const hasAccess = (featureKey) => {
    if (isSuperAdmin) return true;
    return permissions.includes(featureKey);
  };

  const userName = adminUser?.username || adminUser?.fullName || adminUser?.name || 'Deepak';
  const roleName = isSuperAdmin ? 'Super Admin' : 'Admin';

  return (
    <div className="p-4 p-md-4.5 flex-grow-1">
      {/* WELCOME BANNER CARD */}
      <div
        className="rounded-4 p-4 p-md-4.5 mb-4 text-white shadow-sm position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #4F17B5 0%, #7C3AED 100%)',
          borderRadius: '20px'
        }}
      >
        <div className="row align-items-center">
          <div className="col-md-7 z-1">
            <h3 className="fw-bold mb-2 text-white">
              Welcome back, {userName}! 👋
            </h3>
            <p className="mb-0 text-white-50" style={{ fontSize: '0.925rem' }}>
              Here are the modules assigned to your account.
            </p>
          </div>

          {/* Decorative Right Quote & Vector */}
          <div className="col-md-5 text-end d-none d-md-block z-1">
            <div className="d-inline-block text-end">
              <p className="fst-italic mb-2 text-white-50" style={{ fontSize: '0.875rem' }}>
                "Manage Today<br />Build a Better Tomorrow"
              </p>
              <div className="bg-white bg-opacity-50 ms-auto" style={{ width: '40px', height: '2px' }}></div>
            </div>
          </div>
        </div>

        {/* Subtle Chart Graphic SVG background */}
        <svg
          className="position-absolute end-0 bottom-0 opacity-25 pe-none"
          width="240"
          height="120"
          viewBox="0 0 240 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="20" y="60" width="20" height="60" rx="4" fill="white" />
          <rect x="60" y="40" width="20" height="80" rx="4" fill="white" />
          <rect x="100" y="70" width="20" height="50" rx="4" fill="white" />
          <rect x="140" y="20" width="20" height="100" rx="4" fill="white" />
          <rect x="180" y="45" width="20" height="75" rx="4" fill="white" />
        </svg>
      </div>

      {/* SECTION HEADER */}
      <div className="mb-4">
        <h5 className="fw-bold text-dark mb-1">Your Modules</h5>
        <p className="text-muted small mb-0">Click on a module to view and manage the records.</p>
      </div>

      {/* MODULE CARDS GRID */}
      <div className="row g-4">
        {/* STUDENTS RECORDS CARD */}
        {hasAccess('students') && (
          <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-4 bg-white transition-all">
              <div
                className="rounded-3 p-3 d-inline-flex align-items-center justify-content-center mb-3"
                style={{ background: '#F3E8FF', color: '#7C3AED', width: '52px', height: '52px' }}
              >
                <FaUserFriends size={24} />
              </div>

              <h6 className="fw-bold text-dark mb-1 fs-6">Students Records</h6>
              <p className="text-muted small mb-4" style={{ fontSize: '0.825rem', lineHeight: '1.4' }}>
                Manage and view student records, details and activities.
              </p>

              <div
                className="mt-auto rounded-pill p-2 px-3 d-flex align-items-center justify-content-between cursor-pointer transition-all"
                style={{ background: '#F3E8FF' }}
                onClick={() => navigate('/admin/students')}
              >
                <span className="fw-bold small d-flex align-items-center gap-1.5" style={{ color: '#7C3AED' }}>
                  View Records <FaArrowRight size={12} />
                </span>
                <div
                  className="rounded-circle bg-white d-flex align-items-center justify-content-center shadow-sm"
                  style={{ width: '26px', height: '26px', color: '#7C3AED' }}
                >
                  <FaChevronRight size={10} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REGISTRATION RECORDS CARD */}
        {hasAccess('registrations') && (
          <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-4 bg-white transition-all">
              <div
                className="rounded-3 p-3 d-inline-flex align-items-center justify-content-center mb-3"
                style={{ background: '#E0F2FE', color: '#0284C7', width: '52px', height: '52px' }}
              >
                <FaUserPlus size={24} />
              </div>

              <h6 className="fw-bold text-dark mb-1 fs-6">Registration Records</h6>
              <p className="text-muted small mb-4" style={{ fontSize: '0.825rem', lineHeight: '1.4' }}>
                View and manage registration records.
              </p>

              <div
                className="mt-auto rounded-pill p-2 px-3 d-flex align-items-center justify-content-between cursor-pointer transition-all"
                style={{ background: '#E0F2FE' }}
                onClick={() => navigate('/admin/registrations')}
              >
                <span className="fw-bold small d-flex align-items-center gap-1.5" style={{ color: '#0284C7' }}>
                  View Records <FaArrowRight size={12} />
                </span>
                <div
                  className="rounded-circle bg-white d-flex align-items-center justify-content-center shadow-sm"
                  style={{ width: '26px', height: '26px', color: '#0284C7' }}
                >
                  <FaChevronRight size={10} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RESUME RECORDS CARD */}
        {hasAccess('resumes') && (
          <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-4 bg-white transition-all">
              <div
                className="rounded-3 p-3 d-inline-flex align-items-center justify-content-center mb-3"
                style={{ background: '#DCFCE7', color: '#16A34A', width: '52px', height: '52px' }}
              >
                <FaFileAlt size={24} />
              </div>

              <h6 className="fw-bold text-dark mb-1 fs-6">Resume Records</h6>
              <p className="text-muted small mb-4" style={{ fontSize: '0.825rem', lineHeight: '1.4' }}>
                View and manage uploaded resumes and analysis details.
              </p>

              <div
                className="mt-auto rounded-pill p-2 px-3 d-flex align-items-center justify-content-between cursor-pointer transition-all"
                style={{ background: '#DCFCE7' }}
                onClick={() => navigate('/admin/resumes')}
              >
                <span className="fw-bold small d-flex align-items-center gap-1.5" style={{ color: '#16A34A' }}>
                  View Records <FaArrowRight size={12} />
                </span>
                <div
                  className="rounded-circle bg-white d-flex align-items-center justify-content-center shadow-sm"
                  style={{ width: '26px', height: '26px', color: '#16A34A' }}
                >
                  <FaChevronRight size={10} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ATS ANALYSIS HISTORY CARD */}
        {hasAccess('ats-analysis') && (
          <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-4 bg-white transition-all">
              <div
                className="rounded-3 p-3 d-inline-flex align-items-center justify-content-center mb-3"
                style={{ background: '#F3E8FF', color: '#7C3AED', width: '52px', height: '52px' }}
              >
                <FaChartLine size={24} />
              </div>

              <h6 className="fw-bold text-dark mb-1 fs-6">ATS Analysis History</h6>
              <p className="text-muted small mb-4" style={{ fontSize: '0.825rem', lineHeight: '1.4' }}>
                View and analyze ATS resume scan history and metrics.
              </p>

              <div
                className="mt-auto rounded-pill p-2 px-3 d-flex align-items-center justify-content-between cursor-pointer transition-all"
                style={{ background: '#F3E8FF' }}
                onClick={() => navigate('/admin/ats-resume-scans')}
              >
                <span className="fw-bold small d-flex align-items-center gap-1.5" style={{ color: '#7C3AED' }}>
                  View History <FaArrowRight size={12} />
                </span>
                <div
                  className="rounded-circle bg-white d-flex align-items-center justify-content-center shadow-sm"
                  style={{ width: '26px', height: '26px', color: '#7C3AED' }}
                >
                  <FaChevronRight size={10} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TARGET JOBS RECORDS CARD */}
        {hasAccess('target-jobs') && (
          <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-4 bg-white transition-all">
              <div
                className="rounded-3 p-3 d-inline-flex align-items-center justify-content-center mb-3"
                style={{ background: '#FEF3C7', color: '#D97706', width: '52px', height: '52px' }}
              >
                <FaBriefcase size={24} />
              </div>

              <h6 className="fw-bold text-dark mb-1 fs-6">Target Jobs Records</h6>
              <p className="text-muted small mb-4" style={{ fontSize: '0.825rem', lineHeight: '1.4' }}>
                View student target job preferences and target roles.
              </p>

              <div
                className="mt-auto rounded-pill p-2 px-3 d-flex align-items-center justify-content-between cursor-pointer transition-all"
                style={{ background: '#FEF3C7' }}
                onClick={() => navigate('/admin/target-jobs')}
              >
                <span className="fw-bold small d-flex align-items-center gap-1.5" style={{ color: '#D97706' }}>
                  View Records <FaArrowRight size={12} />
                </span>
                <div
                  className="rounded-circle bg-white d-flex align-items-center justify-content-center shadow-sm"
                  style={{ width: '26px', height: '26px', color: '#D97706' }}
                >
                  <FaChevronRight size={10} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MOCK INTERVIEWS CARD */}
        {hasAccess('mock-interviews') && (
          <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-4 bg-white transition-all">
              <div
                className="rounded-3 p-3 d-inline-flex align-items-center justify-content-center mb-3"
                style={{ background: '#E0E7FF', color: '#4F46E5', width: '52px', height: '52px' }}
              >
                <FaBrain size={24} />
              </div>

              <h6 className="fw-bold text-dark mb-1 fs-6">Mock Interviews</h6>
              <p className="text-muted small mb-4" style={{ fontSize: '0.825rem', lineHeight: '1.4' }}>
                View completed AI mock interview sessions and scores.
              </p>

              <div
                className="mt-auto rounded-pill p-2 px-3 d-flex align-items-center justify-content-between cursor-pointer transition-all"
                style={{ background: '#E0E7FF' }}
                onClick={() => navigate('/admin/mock-interviews')}
              >
                <span className="fw-bold small d-flex align-items-center gap-1.5" style={{ color: '#4F46E5' }}>
                  View Records <FaArrowRight size={12} />
                </span>
                <div
                  className="rounded-circle bg-white d-flex align-items-center justify-content-center shadow-sm"
                  style={{ width: '26px', height: '26px', color: '#4F46E5' }}
                >
                  <FaChevronRight size={10} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CERTIFICATES CARD */}
        {hasAccess('certificates') && (
          <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-4 bg-white transition-all">
              <div
                className="rounded-3 p-3 d-inline-flex align-items-center justify-content-center mb-3"
                style={{ background: '#FFE4E6', color: '#E11D48', width: '52px', height: '52px' }}
              >
                <FaAward size={24} />
              </div>

              <h6 className="fw-bold text-dark mb-1 fs-6">Certificates</h6>
              <p className="text-muted small mb-4" style={{ fontSize: '0.825rem', lineHeight: '1.4' }}>
                View and issue verified student interview certificates.
              </p>

              <div
                className="mt-auto rounded-pill p-2 px-3 d-flex align-items-center justify-content-between cursor-pointer transition-all"
                style={{ background: '#FFE4E6' }}
                onClick={() => navigate('/admin/certificates')}
              >
                <span className="fw-bold small d-flex align-items-center gap-1.5" style={{ color: '#E11D48' }}>
                  View Records <FaArrowRight size={12} />
                </span>
                <div
                  className="rounded-circle bg-white d-flex align-items-center justify-content-center shadow-sm"
                  style={{ width: '26px', height: '26px', color: '#E11D48' }}
                >
                  <FaChevronRight size={10} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INQUIRY DETAILS CARD */}
        {hasAccess('inquiries') && (
          <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-4 bg-white transition-all">
              <div
                className="rounded-3 p-3 d-inline-flex align-items-center justify-content-center mb-3"
                style={{ background: '#F3E8FF', color: '#7C3AED', width: '52px', height: '52px' }}
              >
                <FaClipboardList size={24} />
              </div>

              <h6 className="fw-bold text-dark mb-1 fs-6">Inquiry Details</h6>
              <p className="text-muted small mb-4" style={{ fontSize: '0.825rem', lineHeight: '1.4' }}>
                View student support messages and inquiry details.
              </p>

              <div
                className="mt-auto rounded-pill p-2 px-3 d-flex align-items-center justify-content-between cursor-pointer transition-all"
                style={{ background: '#F3E8FF' }}
                onClick={() => navigate('/admin/inquiry-details')}
              >
                <span className="fw-bold small d-flex align-items-center gap-1.5" style={{ color: '#7C3AED' }}>
                  View Records <FaArrowRight size={12} />
                </span>
                <div
                  className="rounded-circle bg-white d-flex align-items-center justify-content-center shadow-sm"
                  style={{ width: '26px', height: '26px', color: '#7C3AED' }}
                >
                  <FaChevronRight size={10} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
