import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import {
  FaShieldAlt,
  FaUsers,
  FaBuilding,
  FaBriefcase,
  FaBrain,
  FaFileAlt,
  FaBell,
  FaSearch,
  FaSync,
  FaCheckCircle,
  FaServer,
  FaArrowUp,
  FaArrowDown,
  FaClock,
  FaChevronDown,
  FaMoon,
  FaSun,

  FaSignOutAlt,
  FaTimes,
  FaChartLine,
  FaExclamationTriangle,
  FaUserGraduate,
  FaUserPlus
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import SuperAdminSidebar from './SuperAdminSidebar';

const kpiIconMap = {
  'total-users': FaUsers,
  'organizations': FaBuilding,
  'active-jobs': FaBriefcase,
  'ai-interviews': FaBrain,
  'resume-scans': FaFileAlt
};

const SuperAdminDashboard = () => {
  const navigate = useNavigate();

  // Interactive UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState('overview');
  const [themeMode, setThemeMode] = useState('light'); // 'light' or 'dark'
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');

  // Real Database State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    kpiCards: [],
    interviewActivityData: [],
    periodTotalInterviews: 0,
    popularTargetJobs: [],
    platformServices: [],
    recentActivities: []
  });

  // Interactive Notifications List State
  const [notificationsList, setNotificationsList] = useState([
    { id: 1, text: 'Real-time production database connected to Super Admin dashboard.', time: '1 min ago', read: false }
  ]);

  const fetchDashboardData = useCallback(async (timeframe = selectedTimeframe, showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true);
      const res = await API.get(`/admin/dashboard?timeframe=${timeframe}`);
      if (res.data && res.data.success) {
        setDashboardData(res.data);
        setError(null);
        if (showToast) toast.success('Platform metrics synced from database');
      } else {
        setError('Failed to fetch live platform metrics');
      }
    } catch (err) {
      console.error('Super Admin Dashboard Error:', err);
      setError(err.response?.data?.message || 'Failed to connect to backend server.');
      if (showToast) toast.error('Failed to sync live production data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedTimeframe]);

  useEffect(() => {
    fetchDashboardData(selectedTimeframe);
    const interval = setInterval(() => {
      fetchDashboardData(selectedTimeframe);
    }, 60000); // Auto refresh every 60 seconds
    return () => clearInterval(interval);
  }, [selectedTimeframe, fetchDashboardData]);

  const handleRefresh = () => {
    fetchDashboardData(selectedTimeframe, true);
  };

  const handleLogout = () => {
    localStorage.removeItem('superAdminToken');
    localStorage.removeItem('superAdminUser');
    toast.success('Super Admin session ended successfully.');
    navigate('/super-admin/login', { replace: true });
  };

  const markAllNotificationsRead = () => {
    setNotificationsList(notificationsList.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const routeMap = {
    'total-users': '/super-admin/users',
    'organizations': '/super-admin/organizations',
    'active-jobs': '/super-admin/jobs-companies',
    'ai-interviews': '/super-admin/ai-interview-engine',
    'resume-scans': '/super-admin/resume-scans'
  };

  const kpiStyleMap = {
    'total-users': {
      bg: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 60%, #1D4ED8 100%)',
      shadow: '0 6px 18px -3px rgba(37, 99, 235, 0.35)'
    },
    'organizations': {
      bg: 'linear-gradient(135deg, #10B981 0%, #059669 60%, #047857 100%)',
      shadow: '0 6px 18px -3px rgba(5, 150, 105, 0.35)'
    },
    'active-jobs': {
      bg: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 60%, #4338CA 100%)',
      shadow: '0 6px 18px -3px rgba(79, 70, 229, 0.35)'
    },
    'ai-interviews': {
      bg: 'linear-gradient(135deg, #A855F7 0%, #9333EA 60%, #7E22CE 100%)',
      shadow: '0 6px 18px -3px rgba(147, 51, 234, 0.35)'
    },
    'resume-scans': {
      bg: 'linear-gradient(135deg, #F97316 0%, #EA580C 60%, #C2410C 100%)',
      shadow: '0 6px 18px -3px rgba(234, 88, 12, 0.35)'
    }
  };

  // KPI cards calculation from DB
  const rawKpiCards = dashboardData.kpiCards && dashboardData.kpiCards.length > 0
    ? dashboardData.kpiCards
    : [
        { id: 'total-users', title: 'Total Users', value: '0', trend: '+0.0%', trendUp: true, timeframe: 'vs last month', color: '#2563EB', bgLight: 'rgba(37, 99, 235, 0.1)', route: '/super-admin/users' },
        { id: 'organizations', title: 'Organizations', value: '0', trend: '+0.0%', trendUp: true, timeframe: 'registered org/HR accounts', color: '#059669', bgLight: 'rgba(5, 150, 105, 0.1)', route: '/super-admin/organizations' },
        { id: 'active-jobs', title: 'Active Jobs', value: '0', trend: '+0.0%', trendUp: true, timeframe: 'predefined & target jobs', color: '#4F46E5', bgLight: 'rgba(79, 70, 229, 0.1)', route: '/super-admin/jobs-companies' },
        { id: 'ai-interviews', title: 'AI Interviews', value: '0', trend: '+0.0%', trendUp: true, timeframe: 'evaluated by AI', color: '#9333EA', bgLight: 'rgba(147, 51, 234, 0.1)', route: '/super-admin/ai-interview-engine' },
        { id: 'resume-scans', title: 'Resume Scans', value: '0', trend: '+0.0%', trendUp: true, timeframe: 'resumes analyzed', color: '#EA580C', bgLight: 'rgba(234, 88, 12, 0.1)', route: '/super-admin/resume-scans' }
      ];

  const interviewActivityData = dashboardData.interviewActivityData || [];
  const popularTargetJobs = dashboardData.popularTargetJobs || [];
  const platformServices = dashboardData.platformServices || [];
  const recentActivities = dashboardData.recentActivities || [];

  // Live search filtering
  const filteredActivities = recentActivities.filter(act => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return act.title?.toLowerCase().includes(q) || act.details?.toLowerCase().includes(q);
  });

  const filteredTargetJobs = popularTargetJobs.filter(tj => {
    if (!searchQuery) return true;
    return tj.role?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const isDarkMode = themeMode === 'dark';
  const cardBgClass = isDarkMode ? 'bg-dark border-secondary text-white' : 'bg-white text-dark';
  const cardTextClass = isDarkMode ? 'text-white' : 'text-dark';
  const textSubtleClass = isDarkMode ? 'text-white-50' : 'text-muted';

  return (
    <div
      className={`super-admin-layout vh-100 d-flex flex-column overflow-hidden ${isDarkMode ? 'bg-black text-white' : 'bg-light text-dark'}`}
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      {/* ========================================================================= */}
      {/* 1. FIXED TOP NAVBAR                                                       */}
      {/* ========================================================================= */}
      <header
        className="flex-shrink-0 border-bottom shadow-md px-3 px-md-4 z-3 d-flex align-items-center justify-content-between position-relative"
        style={{
          height: '56px',
          background: 'linear-gradient(90deg, #09071B 0%, #110D33 50%, #171242 100%)',
          borderColor: 'rgba(129, 140, 248, 0.22)'
        }}
      >
        {/* Left Branding & SUPER ADMIN PORTAL Pill */}
        <div className="d-flex align-items-center gap-2.5">
          <div
            className="rounded-3 p-1.5 text-white d-flex align-items-center justify-content-center shadow-sm cursor-pointer"
            onClick={() => { setActiveSidebarTab('overview'); handleRefresh(); }}
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

        {/* Center: Live Search bar & System Status Indicator */}
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

          {/* Interactive All Systems Operational Trigger */}
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

        {/* Right Actions: Notifications, Theme Switcher, Admin Profile Menu */}
        <div className="d-flex align-items-center gap-2">
          {/* Notifications button with Interactive Dropdown */}
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

            {/* Notifications Panel Dropdown */}
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

          {/* Interactive Dark/Light Theme Toggle Icon */}
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

          {/* Interactive Manual Refresh Button */}
          <button
            className={`btn btn-link text-white-50 p-1.5 border-0 shadow-none ${isRefreshing ? 'spin-anim' : ''}`}
            onClick={handleRefresh}
            title="Refresh Analytics from Database"
          >
            <FaSync size={13} className="text-white-50" />
          </button>

          <div className="vr bg-white bg-opacity-20 mx-1.5 d-none d-sm-block" style={{ height: '22px' }}></div>

          {/* Interactive Admin Profile Pill & Dropdown */}
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

            {/* Profile Dropdown Menu */}
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
              
                <div className="pt-1 border-top border-secondary border-opacity-30">
                  <button
                    className="btn btn-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2 fw-bold"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt size={12} /> Log Out Admin
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MIDDLE BODY CONTAINER (FIXED PURPLE SIDEBAR + SCROLLABLE CONTENT)      */}
      {/* ========================================================================= */}
      <div className="d-flex flex-grow-1 overflow-hidden">
        {/* REUSABLE SUPER ADMIN SIDEBAR COMPONENT */}
        <SuperAdminSidebar
          activeSidebarTab={activeSidebarTab}
          setActiveSidebarTab={setActiveSidebarTab}
          onLogout={handleLogout}
        />

        {/* MAIN COLUMN (SCROLLABLE CONTENT + FIXED FOOTER) */}
        <main className="flex-grow-1 d-flex flex-column overflow-hidden h-100">
          {/* SCROLLABLE INNER DASHBOARD CARDS & CONTENT */}
          <div className="flex-grow-1 overflow-y-auto p-3 p-md-3.5">
            {/* ERROR BANNER IF API FAILS */}
            {error && (
              <div className="alert alert-danger bg-danger bg-opacity-20 border border-danger text-white p-3 rounded-3 mb-3 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <FaExclamationTriangle className="text-danger" size={18} />
                  <span>{error}</span>
                </div>
                <button className="btn btn-sm btn-outline-light" onClick={() => fetchDashboardData(selectedTimeframe, true)}>
                  Retry
                </button>
              </div>
            )}

            {/* WELCOME HERO CARD */}
            <div
              className="card border-0 text-white mb-3 p-3 p-md-3.5 position-relative overflow-hidden shadow-sm"
              style={{
                background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%)',
                borderRadius: '14px',
                border: '1px solid rgba(99, 102, 241, 0.25)'
              }}
            >
              <div className="row align-items-center position-relative z-1">
                <div className="col-lg-8">
                  <h4 className="fw-extrabold text-white mb-1" style={{ letterSpacing: '-0.4px', fontSize: '1.25rem' }}>
                    Welcome back, Master Administrator 👋
                  </h4>
                  <p className="text-white-50 mb-0 small leading-snug max-w-2xl" style={{ fontSize: '0.825rem' }}>
                    Real-time production analytics across total registered candidates, partner organizations, live jobs, AI mock evaluations, and ATS resume scans.
                  </p>
                </div>
                <div className="col-lg-4 text-center text-lg-end mt-2.5 mt-lg-0">
                  <div className="d-inline-flex p-2 rounded-3 bg-white bg-opacity-10 border border-white border-opacity-20">
                    <span className="text-white-50 small me-2" style={{ fontSize: '0.75rem' }}>Production Mode:</span>
                    <strong className="text-success small" style={{ fontSize: '0.75rem' }}>● MongoDB Live Sync</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* 5 DYNAMIC COLOR KPI CARDS GRID */}
            <div className="row g-2.5 mb-3">
              {rawKpiCards.map((kpi) => {
                const IconComponent = kpiIconMap[kpi.id] || FaUsers;
                const targetRoute = kpi.route || routeMap[kpi.id] || '/super-admin/dashboard';
                const styleConfig = kpiStyleMap[kpi.id] || {
                  bg: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                  shadow: '0 6px 18px -3px rgba(37, 99, 235, 0.35)'
                };

                return (
                  <div key={kpi.id} className="col-12 col-sm-6 col-xl-2-4">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(targetRoute)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigate(targetRoute);
                        }
                      }}
                      className="card border-0 p-2.5 p-md-3 h-100 position-relative kpi-card-hover text-white overflow-hidden"
                      style={{
                        background: styleConfig.bg,
                        borderRadius: '15px',
                        boxShadow: styleConfig.shadow,
                        cursor: 'pointer',
                        transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}
                      title={`Click to manage ${kpi.title}`}
                    >
                      <div className="d-flex align-items-center justify-content-between mb-1.5">
                        <span
                          className="fw-bold text-uppercase"
                          style={{
                            fontSize: '0.7rem',
                            letterSpacing: '0.4px',
                            color: 'rgba(255, 255, 255, 0.95)'
                          }}
                        >
                          {kpi.title}
                        </span>
                        <div
                          className="rounded-2 d-flex align-items-center justify-content-center shadow-sm flex-shrink-0"
                          style={{
                            background: 'rgba(255, 255, 255, 0.22)',
                            color: '#FFFFFF',
                            width: '28px',
                            height: '28px',
                            backdropFilter: 'blur(6px)',
                            border: '1px solid rgba(255, 255, 255, 0.3)'
                          }}
                        >
                          <IconComponent size={13} />
                        </div>
                      </div>

                      <h4 className="fw-black text-white my-1" style={{ letterSpacing: '-0.5px', fontSize: '1.35rem', fontWeight: 800 }}>
                        {loading ? '...' : kpi.value}
                      </h4>

                      <div className="d-flex align-items-center gap-1.5 mt-auto flex-wrap">
                        <span
                          className="badge fw-bold px-1.5 py-0.5 rounded-2 d-inline-flex align-items-center gap-1 shadow-sm"
                          style={{
                            background: 'rgba(255, 255, 255, 0.25)',
                            color: '#FFFFFF',
                            fontSize: '0.65rem',
                            border: '1px solid rgba(255, 255, 255, 0.35)',
                            backdropFilter: 'blur(4px)'
                          }}
                        >
                          {kpi.trendUp ? <FaArrowUp size={7} /> : <FaArrowDown size={7} />}
                          {kpi.trend}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.88)', fontWeight: 500 }}>
                          {kpi.timeframe}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* INTERVIEW ACTIVITY CHART & POPULAR TARGET JOBS */}
            <div className="row g-3 mb-3">
              {/* AI INTERVIEW ACTIVITY TRENDS GRAPH */}
              <div className="col-lg-7 col-xl-8">
                <div className={`card border-0 shadow-sm p-3 p-md-3.5 h-100 ${cardBgClass}`} style={{ borderRadius: '14px' }}>
                  <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 mb-3 pb-2 border-bottom">
                    <div>
                      <h6 className={`fw-bold mb-0 d-flex align-items-center gap-2 ${cardTextClass}`} style={{ fontSize: '0.9rem' }}>
                        <FaBrain style={{ color: '#9333EA' }} size={15} /> AI Interview Activity Trends
                      </h6>
                      <span className={textSubtleClass} style={{ fontSize: '0.725rem' }}>Daily mock evaluations completed by Gemini AI</span>
                    </div>
                    <div className="btn-group btn-group-sm bg-light p-0.5 rounded-pill border">
                      <button
                        className={`btn btn-sm rounded-pill px-2.5 py-0.5 fw-semibold border-0 ${selectedTimeframe === '7d' ? 'btn-primary shadow-sm' : 'btn-light text-muted'}`}
                        onClick={() => setSelectedTimeframe('7d')}
                        style={{ fontSize: '0.7rem' }}
                      >
                        7 Days
                      </button>
                      <button
                        className={`btn btn-sm rounded-pill px-2.5 py-0.5 fw-semibold border-0 ${selectedTimeframe === '30d' ? 'btn-primary shadow-sm' : 'btn-light text-muted'}`}
                        onClick={() => setSelectedTimeframe('30d')}
                        style={{ fontSize: '0.7rem' }}
                      >
                        30 Days
                      </button>
                    </div>
                  </div>

                  <div className="d-flex align-items-end justify-content-between gap-2 pt-2 pb-1 px-1" style={{ height: '165px' }}>
                    {interviewActivityData.map((bar, idx) => (
                      <div key={idx} className="d-flex flex-column align-items-center flex-grow-1 h-100 justify-content-end">
                        <span className={`fw-bold mb-1 ${cardTextClass}`} style={{ fontSize: '0.65rem' }}>
                          {bar.count}
                        </span>
                        <div
                          className="w-100 rounded-top transition-all"
                          style={{
                            height: `${bar.heightPct || 15}%`,
                            background: `linear-gradient(180deg, ${bar.color || '#4F46E5'} 0%, #312E81 100%)`,
                            minWidth: '16px',
                            maxWidth: '38px',
                            boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)'
                          }}
                          title={`${bar.day} (${bar.date || ''}): ${bar.count} interview(s)`}
                        ></div>
                        <span className={`fw-semibold mt-1.5 ${textSubtleClass}`} style={{ fontSize: '0.7rem' }}>
                          {bar.day}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className={`d-flex align-items-center justify-content-between pt-2 mt-2 border-top ${textSubtleClass}`} style={{ fontSize: '0.725rem' }}>
                    <span>Period Total: <strong>{dashboardData.periodTotalInterviews || interviewActivityData.reduce((a, b) => a + (b.count || 0), 0)} interviews</strong></span>
                    <span className="text-success fw-semibold"><FaCheckCircle size={10} /> Real DB Aggregate</span>
                  </div>
                </div>
              </div>

              {/* POPULAR TARGET JOBS PROGRESS BARS */}
              <div className="col-lg-5 col-xl-4">
                <div className={`card border-0 shadow-sm p-3 p-md-3.5 h-100 ${cardBgClass}`} style={{ borderRadius: '14px' }}>
                  <div className="d-flex align-items-center justify-content-between mb-2.5 pb-2 border-bottom">
                    <h6 className={`fw-bold mb-0 d-flex align-items-center gap-2 ${cardTextClass}`} style={{ fontSize: '0.9rem' }}>
                      <FaBriefcase className="text-primary" size={14} /> Popular Target Jobs
                    </h6>
                    <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-20" style={{ fontSize: '0.65rem' }}>
                      {filteredTargetJobs.length} Top Roles
                    </span>
                  </div>

                  {filteredTargetJobs.length === 0 ? (
                    <div className={`p-4 text-center my-auto ${textSubtleClass}`} style={{ fontSize: '0.8rem' }}>
                      No target job selections recorded yet.
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-2.5 my-auto">
                      {filteredTargetJobs.slice(0, 5).map((tj, idx) => (
                        <div key={idx}>
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <span className={`fw-bold ${cardTextClass}`} style={{ fontSize: '0.775rem' }}>{tj.role}</span>
                            <span className={textSubtleClass} style={{ fontSize: '0.68rem' }}>{tj.count}</span>
                          </div>
                          <div className="progress" style={{ height: '6px', borderRadius: '3px', background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0' }}>
                            <div
                              className="progress-bar"
                              role="progressbar"
                              style={{ width: `${tj.sharePct || 50}%`, backgroundColor: tj.color || '#4F46E5' }}
                              aria-valuenow={tj.sharePct || 50}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* PLATFORM SYSTEM HEALTH & RECENT PLATFORM ACTIVITY LOG */}
            <div className="row g-3">
              {/* PLATFORM SYSTEM HEALTH */}
              <div className="col-lg-5 col-xl-4">
                <div className={`card border-0 shadow-sm p-3 p-md-3.5 h-100 ${cardBgClass}`} style={{ borderRadius: '14px' }}>
                  <div className="d-flex align-items-center justify-content-between mb-2.5 pb-2 border-bottom">
                    <h6 className={`fw-bold mb-0 d-flex align-items-center gap-2 ${cardTextClass}`} style={{ fontSize: '0.9rem' }}>
                      <FaServer className="text-success" size={14} /> Platform System Health
                    </h6>
                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-20 px-2 py-0.5" style={{ fontSize: '0.65rem' }}>
                      Live Status
                    </span>
                  </div>

                  <div className="d-flex flex-column gap-2">
                    {platformServices.map((srv, idx) => (
                      <div key={idx} className={`p-2 px-2.5 rounded border d-flex align-items-center justify-content-between ${isDarkMode ? 'bg-secondary bg-opacity-20 border-secondary' : 'bg-light border'}`}>
                        <div>
                          <span className={`d-block fw-bold ${cardTextClass}`} style={{ fontSize: '0.75rem' }}>{srv.name}</span>
                          <span className={textSubtleClass} style={{ fontSize: '0.65rem' }}>
                            Latency: {srv.latency} | Uptime: {srv.uptime || '99.99%'}
                          </span>
                        </div>
                        <span className={`badge ${srv.badgeClass || 'bg-success'} px-2 py-0.5`} style={{ fontSize: '0.65rem' }}>{srv.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RECENT PLATFORM ACTIVITY STREAM */}
              <div className="col-lg-7 col-xl-8">
                <div className={`card border-0 shadow-sm p-3 p-md-3.5 h-100 ${cardBgClass}`} style={{ borderRadius: '14px' }}>
                  <div className="d-flex align-items-center justify-content-between mb-2.5 pb-2 border-bottom">
                    <div>
                      <h6 className={`fw-bold mb-0 d-flex align-items-center gap-2 ${cardTextClass}`} style={{ fontSize: '0.9rem' }}>
                        <FaClock className="text-info" size={14} /> Recent Platform Activity
                      </h6>
                      <span className={textSubtleClass} style={{ fontSize: '0.68rem' }}>Live database operational log</span>
                    </div>
                    <span className="badge bg-light text-dark border" style={{ fontSize: '0.65rem' }}>
                      {filteredActivities.length} Events
                    </span>
                  </div>

                  {filteredActivities.length === 0 ? (
                    <div className={`p-4 text-center ${textSubtleClass}`} style={{ fontSize: '0.8rem' }}>
                      No platform events recorded yet.
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {filteredActivities.map((act, idx) => (
                        <div key={act.id || idx} className={`p-2 px-2.5 rounded border d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-1.5 ${isDarkMode ? 'bg-secondary bg-opacity-20 border-secondary' : 'bg-light bg-opacity-60 border'}`}>
                          <div className="d-flex align-items-start gap-2.5">
                            <div className="p-1.5 rounded-circle bg-white border text-primary mt-0.5 shadow-sm flex-shrink-0">
                              <FaCheckCircle className="text-success" size={12} />
                            </div>
                            <div>
                              <h6 className={`fw-bold mb-0 ${cardTextClass}`} style={{ fontSize: '0.8rem' }}>{act.title}</h6>
                              <p className={`mb-0 ${textSubtleClass}`} style={{ fontSize: '0.725rem' }}>{act.details}</p>
                            </div>
                          </div>
                          <div className="ms-sm-auto text-sm-end flex-shrink-0">
                            <span className={`badge ${act.tagClass || 'bg-primary bg-opacity-10 text-primary'} px-2 py-0.5 fw-semibold`} style={{ fontSize: '0.65rem' }}>
                              {act.tag || 'Completed'}
                            </span>
                            <span className={`d-block mt-0.5 ${textSubtleClass}`} style={{ fontSize: '0.625rem' }}>
                              {act.time}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* END OF SCROLLABLE INNER CONTENT */}
          </div>

          {/* FIXED WHITE FOOTER AT BOTTOM OF MAIN CONTENT AREA */}
          <footer
            className="w-100 flex-shrink-0 d-flex align-items-center justify-content-center px-4 bg-white border-top shadow-sm"
            style={{
              minHeight: '54px',
              height: '54px',
              borderColor: '#E2E8F0',
              zIndex: 10
            }}
          >
            <p className="mb-0 text-center fw-medium text-secondary" style={{ fontSize: '0.85rem', letterSpacing: '0.2px' }}>
              © {new Date().getFullYear()} HireSmart AI. All rights reserved.
            </p>
          </footer>
        </main>
      </div>

      {/* SYSTEM HEALTH MODAL POPUP */}
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

      {/* Custom Styles for 5-column grid & animations */}
      <style>{`
        @media (min-width: 1200px) {
          .col-xl-2-4 {
            flex: 0 0 auto;
            width: 20%;
          }
        }
        .spin-anim {
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        .hover-bg-dark:hover {
          background: rgba(255, 255, 255, 0.08) !important;
        }
        .kpi-card-hover:hover {
          transform: translateY(-4px);
          filter: brightness(1.06);
          border-color: rgba(255, 255, 255, 0.45) !important;
        }
      `}</style>
    </div>
  );
};

export default SuperAdminDashboard;