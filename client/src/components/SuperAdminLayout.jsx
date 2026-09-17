import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import SuperAdminSidebar from '../pages/super-admin/SuperAdminSidebar';
import API from '../services/api';
import {
  FaShieldAlt,
  FaSearch,
  FaTimes,
  FaChevronDown,
  FaBell,
  FaSun,
  FaMoon,
  FaSync,
  FaUserShield,
  FaUser,
  FaLock,
  FaSignOutAlt,
  FaServer
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const SuperAdminLayout = () => {
  const navigate = useNavigate();

  // Shared Navbar UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [themeMode, setThemeMode] = useState('light');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [adminUser, setAdminUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('superAdminUser') || '{}');
    } catch {
      return {};
    }
  });

  useEffect(() => {
    API.get('/admin/me')
      .then((res) => {
        if (res.data?.user) {
          setAdminUser(res.data.user);
          localStorage.setItem('superAdminUser', JSON.stringify(res.data.user));
        }
      })
      .catch(() => {});
  }, []);

  const [notificationsList, setNotificationsList] = useState([
    { id: 1, text: 'Real-time production database connected to Super Admin portal.', time: '1 min ago', read: false }
  ]);

  const platformServices = [
    { name: 'MongoDB Atlas Primary', status: 'Healthy', latency: '12ms', badgeClass: 'bg-success' },
    { name: 'Gemini 1.5 Pro AI Engine', status: 'Healthy', latency: '45ms', badgeClass: 'bg-success' },
    { name: 'Express Backend API Server', status: 'Healthy', latency: '8ms', badgeClass: 'bg-success' },
    { name: 'JWT Auth & Session Manager', status: 'Healthy', latency: '5ms', badgeClass: 'bg-success' }
  ];

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('superAdminToken');
    localStorage.removeItem('superAdminUser');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    toast.success('Super Admin session ended successfully.');
    setShowLogoutConfirm(false);
    navigate('/super-admin/login', { replace: true });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    toast.success('Refreshing Super Admin portal...');
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const markAllNotificationsRead = () => {
    setNotificationsList(notificationsList.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const isDarkMode = themeMode === 'dark';
  const displayName = adminUser.fullName || adminUser.name || '';
  const avatarInitials = displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <div
      className={`super-admin-layout vh-100 d-flex flex-column overflow-hidden ${isDarkMode ? 'bg-black text-white' : 'bg-light text-dark'}`}
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      {/* ========================================================================= */}
      {/* 1. PERSISTENT FIXED TOP NAVBAR                                            */}
      {/* ========================================================================= */}
      <header
        className="flex-shrink-0 border-bottom shadow-md px-3 px-md-4 z-3 d-flex align-items-center justify-content-between position-relative"
        style={{
          height: '56px',
          background: 'linear-gradient(90deg, #09071B 0%, #110D33 50%, #171242 100%)',
          borderColor: 'rgba(129, 140, 248, 0.22)'
        }}
      >
        {/* Left Branding */}
        <div className="d-flex align-items-center gap-2.5">
          <div
            className="rounded-3 p-1.5 text-white d-flex align-items-center justify-content-center shadow-sm cursor-pointer"
            onClick={() => navigate('/super-admin/dashboard')}
            style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', width: '34px', height: '34px' }}
          >
            <FaShieldAlt size={18} className="text-white" />
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="fw-extrabold text-white" style={{ fontSize: '1.15rem', letterSpacing: '-0.3px' }}>
              HireSmart <span style={{ color: '#818CF8' }}>AI</span>
            </span>
            <span
              className="badge rounded-pill px-2.5 py-1 ms-1 d-none d-sm-inline-block shadow-sm"
              style={{
                background: 'rgba(99, 102, 241, 0.25)',
                border: '1px solid rgba(129, 140, 248, 0.45)',
                color: '#E0E7FF',
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.5px'
              }}
            >
              SUPER ADMIN PORTAL
            </span>
          </div>
        </div>

     

        {/* Right Actions */}
        <div className="d-flex align-items-center gap-2">
    
          <div className="vr bg-white bg-opacity-20 mx-1.5 d-none d-sm-block" style={{ height: '22px' }}></div>

          {/* Admin Profile Dropdown */}
          <div className="position-relative">
            <div
              className="d-flex align-items-center gap-2 cursor-pointer p-0.5 pe-1"
              onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
            >
              <div
                className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center shadow-sm"
                style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)', fontSize: '0.775rem' }}
              >
                {avatarInitials}
              </div>
              <div className="d-none d-sm-block text-start lh-1">
                <span className="d-block fw-bold text-white" style={{ fontSize: '0.8rem' }}>{displayName}</span>
                <span className="text-white" style={{ fontSize: '0.65rem' }}>{adminUser.email || ''}</span>
              </div>
              <FaChevronDown size={10} className="text-white ms-1 d-none d-sm-inline" />
            </div>

            {showProfileMenu && (
              <div
                className="position-absolute end-0 mt-2 card border-0 shadow-lg text-white p-2 z-3"
                style={{
                  width: '220px',
                  background: '#120F33',
                  borderRadius: '12px',
                  border: '1px solid rgba(129, 140, 248, 0.3)'
                }}
              >
                <div className="p-2 border-bottom border-secondary border-opacity-30">
                  <span className="d-block fw-bold text-white small">{displayName}</span>
                  <span className="text-white" style={{ fontSize: '0.68rem' }}>{adminUser.email || ''}</span>
                </div>
                <div className="pt-2">
                  <button
                    className="btn btn-link text-white text-decoration-none btn-sm w-100 d-flex align-items-center gap-2 fw-bold"
                    onClick={() => { setShowProfileMenu(false); navigate('/super-admin/profile'); }}
                  >
                    <FaUser size={12} /> My Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MIDDLE BODY CONTAINER (PERSISTENT SIDEBAR + DYNAMIC MAIN OUTLET)       */}
      {/* ========================================================================= */}
      <div className="d-flex flex-grow-1 overflow-hidden">
        {/* PERSISTENT FIXED SIDEBAR */}
        <SuperAdminSidebar onLogout={handleLogout} />

        {/* MAIN COLUMN (DYNAMIC OUTLET + PERSISTENT FOOTER) */}
        <main className="flex-grow-1 d-flex flex-column overflow-hidden h-100">
          {/* DYNAMIC NAVIGATION SCROLLABLE MAIN CONTENT AREA */}
          <div className="flex-grow-1 overflow-y-auto">
            <Outlet />
          </div>

          {/* PERSISTENT FIXED FOOTER */}
          <footer
            className="flex-shrink-0 border-top py-2 px-4 bg-white z-2"
            style={{
              borderColor: 'rgba(0,0,0,0.08)'
            }}
          >
                <p
                className="mb-0 text-center fw-medium"
                style={{
                  fontSize: '0.85rem',
                  letterSpacing: '0.2px'
                }}
              >
                <span style={{ color: '#6f42c1' }}>
                  © {new Date().getFullYear()}
                </span>{' '}

                <span style={{ color: '#6f42c1' }}>Hire</span>
                <span style={{ color: '#0d6efd' }}>Smart</span>{' '}
                <span style={{ color: '#198754' }}>AI</span>

                <span style={{ color: '#6c757d' }}>
                  . All rights reserved.
                </span>
              </p>
          </footer>
        </main>
      </div>

      {showLogoutConfirm && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', zIndex: 2000 }}>
          <div className="card border-0 shadow-lg" style={{ width: '420px', borderRadius: '18px', background: '#ffffff' }}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="d-flex align-items-center justify-content-center rounded-circle bg-danger bg-opacity-10" style={{ width: '48px', height: '48px' }}>
                  <FaSignOutAlt className="text-danger" size={22} />
                </div>
                <div>
                  <h5 className="mb-1 fw-bold text-dark">Log out Super Admin?</h5>
                  <p className="mb-0 text-muted small">This will end your admin session and redirect you to the login page.</p>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={confirmLogout}
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SYSTEM HEALTH DIAGNOSTICS MODAL POPUP */}
      {showHealthModal && (
        <div className="position-fixed bottom-0 end-0 m-3 card border-0 shadow-lg p-3 z-3 text-white" style={{ width: '340px', background: '#120F33', borderRadius: '14px', border: '1px solid rgba(129, 140, 248, 0.4)' }}>
          <div className="d-flex align-items-center justify-content-between border-bottom border-secondary border-opacity-30 pb-2 mb-2">
            <span className="fw-bold small d-flex align-items-center gap-1.5 text-success">
              <FaServer /> System Infrastructure Diagnostics
            </span>
            <button className="btn btn-link p-0 text-white-50 border-0" onClick={() => setShowHealthModal(false)}>
              <FaTimes size={14} />
            </button>
          </div>
          <div className="d-flex flex-column gap-2 small" style={{ fontSize: '0.75rem' }}>
            {platformServices.map((srv, idx) => (
              <div key={idx} className="d-flex justify-content-between align-items-center">
                <span>{srv.name}:</span>
                <span className={`badge ${srv.badgeClass} px-2 py-0.5`}>{srv.status} ({srv.latency})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminLayout;
