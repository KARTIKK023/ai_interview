import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaChartLine,
  FaUserGraduate,
  FaUserPlus,
  FaFileAlt,
  FaBriefcase,
  FaBrain,
  FaAward,
  FaSignOutAlt
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const SuperAdminSidebar = ({ activeSidebarTab, setActiveSidebarTab, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('superAdminToken');
      localStorage.removeItem('superAdminUser');
      toast.success('Super Admin logged out successfully');
      navigate('/super-admin/login');
    }
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaChartLine, route: '/super-admin/dashboard' },
    { id: 'students', label: 'Students Records', icon: FaUserGraduate, route: '/super-admin/students', badge: 'Live' },
    { id: 'registrations', label: 'Registration Records', icon: FaUserPlus, route: '/super-admin/registrations', badge: 'Records' },
    { id: 'resumes', label: 'Resume Records', icon: FaFileAlt, route: '/super-admin/resumes', badge: 'ATS' },
    { id: 'target-jobs', label: 'Target Jobs Records', icon: FaBriefcase, route: '/super-admin/target-jobs', badge: 'Jobs' },
    { id: 'mock-interviews', label: 'Mock Interviews', icon: FaBrain, route: '/super-admin/mock-interviews', badge: 'AI' },
    { id: 'certificates', label: 'Certificates', icon: FaAward, route: '/super-admin/certificates', badge: 'Verify' },
    { id: 'logout', label: 'Logout', icon: FaSignOutAlt, isLogout: true }
  ];

  return (
    <aside
      className="super-admin-sidebar border-end d-none d-lg-flex flex-column flex-shrink-0 h-100 p-2.5"
      style={{
        width: '240px',
        background: '#4C1D95',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        color: '#FFFFFF'
      }}
    >
      {/* NAVIGATION HEADER */}
      <div className="px-2 pt-1 pb-2 border-bottom" style={{ borderColor: 'rgba(255, 255, 255, 0.15)' }}>
        <span
          className="fw-bold uppercase"
          style={{ fontSize: '0.9rem', letterSpacing: '0.6px', color: '#FFFFFF' }}
        >
          Super Admin Menu
        </span>
      </div>

      {/* NAVIGATION ITEMS */}
      <div className="d-flex flex-column gap-1 my-2">
        {sidebarItems.map((item) => {
          const IconComp = item.icon;
          const isActive = item.route
            ? (currentPath === item.route || (item.route === '/super-admin/dashboard' && currentPath === '/super-admin'))
            : (activeSidebarTab === item.id);

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.isLogout) {
                  handleLogout();
                } else {
                  if (setActiveSidebarTab) setActiveSidebarTab(item.id);
                  if (item.route) navigate(item.route);
                }
              }}
              className="btn border-0 text-start d-flex align-items-center justify-content-between px-2.5 py-2 rounded-3 transition-all"
              style={{
                background: isActive ? '#bf24ba' : 'transparent',
                fontSize: '0.825rem',
                fontWeight: isActive ? 700 : 500,
                color: item.isLogout ? '#FECACA' : '#FFFFFF'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = '#bf24ba';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <div className="d-flex align-items-center gap-2.5">
                <IconComp size={15} style={{ color: item.isLogout ? '#FCA5A5' : '#FFFFFF' }} />
                <span className="text-truncate" style={{ fontSize: '0.825rem' }}>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className="badge rounded-pill px-2 py-0.5"
                  style={{
                    background: '#8B5CF6',
                    color: '#FFFFFF',
                    fontSize: '0.6rem',
                    fontWeight: 600
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default SuperAdminSidebar;
