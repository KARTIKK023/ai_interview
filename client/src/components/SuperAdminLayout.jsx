import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import SuperAdminSidebar from '../pages/super-admin/SuperAdminSidebar';
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
  const [themeMode, setThemeMode] = useState('light');
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    localStorage.removeItem('superAdminToken');
    localStorage.removeItem('superAdminUser');
    toast.success('Super Admin session ended successfully.');
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

        {/* Center: Search & System Status */}
        <div className="d-none d-md-flex align-items-center gap-3">
          <div
            className="position-relative d-flex align-items-center"
            style={{
              width: '350px',
              background: 'rgba(255, 255, 255, 0.07)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '9999px',
              height: '34px'
            }}
          >
            <FaSearch className="ms-3 text-white-50 flex-shrink-0" size={12} />
            <input
              type="text"
              className="form-control bg-transparent border-0 text-white ps-2 pe-5 py-1 shadow-none"
              placeholder="Search candidates, orgs, logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ fontSize: '0.8rem', color: '#FFFFFF' }}
            />
            {searchQuery ? (
              <button
                className="btn btn-link p-0 me-2 text-white-50 border-0"
                onClick={() => setSearchQuery('')}
              >
                <FaTimes size={12} />
              </button>
            ) : (
              <span
                className="position-absolute end-0 me-2 badge text-white-50 border border-white border-opacity-10 px-1.5 py-0.5 rounded"
                style={{ fontSize: '0.625rem', fontFamily: 'monospace', background: 'rgba(255, 255, 255, 0.08)' }}
              >
                ⌘ K
              </span>
            )}
          </div>

          <div
            className="d-flex align-items-center gap-2 text-white-50 px-2.5 py-1 rounded-pill cursor-pointer transition-all hover-glow"
            onClick={() => setShowHealthModal(!showHealthModal)}
            style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)' }}
          >
            <span className="rounded-circle" style={{ width: '8px', height: '8px', background: '#10B981', boxShadow: '0 0 8px #10B981' }}></span>
            <strong className="text-white" style={{ fontSize: '0.775rem' }}>All Systems Operational</strong>
            <FaChevronDown size={9} className="text-white-50 ms-0.5" />
          </div>
        </div>

        {/* Right Actions */}
        <div className="d-flex align-items-center gap-2">
          {/* Notifications */}
          <div className="position-relative">
            <button
              className="btn btn-link text-white-50 p-1.5 position-relative border-0 shadow-none"
              onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
              title="Notifications"
            >
              <FaBell size={16} className="text-white-50" />
              {notificationsList.some(n => !n.read) && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-circle"
                  style={{ fontSize: '0.55rem', padding: '3px 5px', background: '#8B5CF6', color: '#FFFFFF' }}
                >
                  {notificationsList.filter(n => !n.read).length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                className="position-absolute end-0 mt-2 card border-0 shadow-lg text-white p-3 z-3"
                style={{
                  width: '320px',
                  background: '#120F33',
                  borderRadius: '12px',
                  border: '1px solid rgba(129, 140, 248, 0.3)'
                }}
              >
                <div className="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom border-secondary border-opacity-30">
                  <span className="fw-bold small">System Notifications</span>
                  <button className="btn btn-link p-0 text-info small" onClick={markAllNotificationsRead} style={{ fontSize: '0.7rem' }}>
                    Mark all read
                  </button>
                </div>
                <div className="d-flex flex-column gap-2 max-h-60 overflow-auto">
                  {notificationsList.map(n => (
                    <div key={n.id} className={`p-2 rounded ${n.read ? 'bg-dark bg-opacity-40' : 'bg-primary bg-opacity-20 border border-primary border-opacity-30'}`}>
                      <p className="small mb-1 leading-snug" style={{ fontSize: '0.75rem' }}>{n.text}</p>
                      <span className="text-white-50" style={{ fontSize: '0.65rem' }}>{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Theme Switcher */}
          <button
            className="btn btn-link text-white-50 p-1.5 border-0 shadow-none ms-1"
            onClick={() => {
              const nextMode = isDarkMode ? 'light' : 'dark';
              setThemeMode(nextMode);
              toast.success(`Switched to ${nextMode} mode`);
            }}
            title={`Toggle Theme (Current: ${themeMode})`}
          >
            {isDarkMode ? <FaSun size={15} className="text-warning" /> : <FaMoon size={15} className="text-white-50" />}
          </button>

          {/* Refresh Button */}
          <button
            className={`btn btn-link text-white-50 p-1.5 border-0 shadow-none ${isRefreshing ? 'spin-anim' : ''}`}
            onClick={handleRefresh}
            title="Refresh Analytics from Database"
          >
            <FaSync size={13} className="text-white-50" />
          </button>

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
                SA
              </div>
              <div className="d-none d-sm-block text-start lh-1">
                <span className="d-block fw-bold text-white" style={{ fontSize: '0.8rem' }}>Super Admin</span>
                <span className="text-white-50" style={{ fontSize: '0.65rem' }}>superadmin@hiresmart.ai</span>
              </div>
              <FaChevronDown size={10} className="text-white-50 ms-1 d-none d-sm-inline" />
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
                  <span className="d-block fw-bold text-white small">Master Administrator</span>
                  <span className="text-white-50" style={{ fontSize: '0.68rem' }}>superadmin@hiresmart.ai</span>
                </div>
                <div className="pt-2">
                  <button
                    className="btn btn-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2 fw-bold"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt size={12} /> Log Out Admin Session
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
            <p className="mb-0 text-center fw-medium text-secondary" style={{ fontSize: '0.85rem', letterSpacing: '0.2px' }}>
              © {new Date().getFullYear()} HireSmart AI. All rights reserved.
            </p>
          </footer>
        </main>
      </div>

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
