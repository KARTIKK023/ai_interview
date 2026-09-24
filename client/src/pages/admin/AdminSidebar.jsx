import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaThLarge,
  FaUserFriends,
  FaUserPlus,
  FaFileAlt,
  FaBriefcase,
  FaBrain,
  FaAward,
  FaClipboardList,
  FaSignOutAlt,
  FaShieldAlt,
  FaChartLine,
  FaExclamationTriangle
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import API from '../../services/api';

const ALL_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: FaThLarge, route: '/admin/dashboard', permission: 'dashboard' },
  { id: 'students', label: 'Students Records', icon: FaUserFriends, route: '/admin/students', permission: 'students' },
  { id: 'registrations', label: 'Registration Records', icon: FaUserPlus, route: '/admin/registrations', permission: 'registrations' },
  { id: 'ats-analysis', label: 'ATS Analysis History', icon: FaChartLine, route: '/admin/ats-resume-scans', permission: 'ats-analysis' },
  { id: 'resumes', label: 'Resume Records', icon: FaFileAlt, route: '/admin/resumes', permission: 'resumes' },
  { id: 'target-jobs', label: 'Target Jobs Records', icon: FaBriefcase, route: '/admin/target-jobs', permission: 'target-jobs' },
  { id: 'mock-interviews', label: 'Mock Interviews', icon: FaBrain, route: '/admin/mock-interviews', permission: 'mock-interviews' },
  { id: 'certificates', label: 'Certificates', icon: FaAward, route: '/admin/certificates', permission: 'certificates' },
  { id: 'inquiry', label: 'Inquiry Details', icon: FaClipboardList, route: '/admin/inquiry-details', permission: 'inquiries' }
];

const AdminSidebar = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Retrieve Admin permissions from local storage user session
  let permissions = [];
  try {
    const storedUser = localStorage.getItem('adminUser') || localStorage.getItem('superAdminUser');
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      permissions = userObj.permissions || [];
    }
  } catch (err) {
    console.error('Error parsing admin user permissions:', err);
  }

  // Filter items based on assigned permissions
  const allowedNavItems = ALL_NAV_ITEMS.filter((item) => {
    if (item.permission === 'dashboard') return true;
    return permissions.includes(item.permission);
  });

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      setLoggingOut(true);
      await API.post('/auth/logout').catch(() => {});
    } catch (err) {
      console.error('Logout API call error:', err);
    } finally {
      if (onLogout) {
        onLogout();
      } else {
        localStorage.removeItem('superAdminToken');
        localStorage.removeItem('superAdminUser');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        toast.success('Logged out successfully');
        navigate('/super-admin/login');
      }
      setShowLogoutModal(false);
      setLoggingOut(false);
    }
  };

  return (
    <>
      <aside
        className="admin-sidebar d-flex flex-column flex-shrink-0 h-100 p-3"
        style={{
          width: '250px',
          background: '#210B4D',
          color: '#FFFFFF'
        }}
      >
        {/* BRANDING HEADER */}
        <div className="px-2 pt-2 pb-4 mb-2 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <div
              className="rounded-3 p-2 d-flex align-items-center justify-content-center"
              style={{ background: 'rgba(255, 255, 255, 0.05)' }}
            >
              <FaShieldAlt style={{ color: '#EAB308' }} size={22} />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-white" style={{ letterSpacing: '0.3px', fontSize: '1.05rem' }}>
                HireSmart AI
              </h5>
              <span
                className="fw-bold uppercase text-white-50"
                style={{ fontSize: '0.625rem', letterSpacing: '1px' }}
              >
                ADMIN PORTAL
              </span>
            </div>
          </div>
          <button
            type="button"
            className="btn-close btn-close-white d-lg-none"
            data-bs-dismiss="offcanvas"
            data-bs-target="#adminSidebar"
            aria-label="Close menu"
          ></button>
        </div>

        {/* NAVIGATION ITEMS */}
        <div className="d-flex flex-column gap-1.5 flex-grow-1">
          {allowedNavItems.map((item) => {
            const IconComp = item.icon;
            const isActive = currentPath === item.route;

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.route)}
                className="btn border-0 text-start d-flex align-items-center px-3 py-2.5 rounded-3 transition-all"
                style={{
                  background: isActive ? 'linear-gradient(90deg, #7C3AED 0%, #6D28D9 100%)' : 'transparent',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 600 : 500,
                  color: '#FFFFFF'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = '#2E1065';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <IconComp size={16} style={{ color: '#FFFFFF' }} />
                  <span className="text-truncate" style={{ fontSize: '0.85rem' }}>
                    {item.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* LOGOUT AT BOTTOM */}
        <div className="pt-3 mt-auto border-top border-white border-opacity-10">
          <button
            onClick={handleLogoutClick}
            className="btn border-0 text-start d-flex align-items-center gap-3 px-3 py-2.5 rounded-3 w-100"
            style={{ background: 'transparent', color: '#FFFFFF', fontSize: '0.85rem', fontWeight: 500 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <FaSignOutAlt size={16} style={{ color: '#FFFFFF' }} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* LOGOUT CONFIRMATION POPUP / MODAL */}
      {showLogoutModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '420px' }}>
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div
                className="modal-header border-0 text-white p-4"
                style={{ background: 'linear-gradient(135deg, #3A0D78 0%, #210B4D 100%)' }}
              >
<div className="d-flex align-items-center gap-2.5">
                  <div className="rounded-circle bg-danger bg-opacity-20 p-2 text-danger d-flex align-items-center justify-content-center">
                    <FaSignOutAlt size={18} className="text-white" />
                  </div>
                  <h5 className="modal-title fw-bold text-white mb-0" style={{ fontSize: '1.1rem' }}>
                    Confirm Logout
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowLogoutModal(false)}
                  disabled={loggingOut}
                ></button>
              </div>

              <div className="modal-body p-4 text-center">
                <div
                  className="rounded-circle bg-purple bg-opacity-10 text-purple d-inline-flex align-items-center justify-content-center p-3 mb-3"
                  style={{ width: '60px', height: '60px', color: '#6D28D9', background: '#F3E8FF' }}
                >
                  <FaExclamationTriangle size={28} />
                </div>
                <h6 className="fw-bold text-dark mb-2">Are you sure you want to log out?</h6>
                <p className="text-muted small mb-0" style={{ lineHeight: '1.5' }}>
                  Logging out will safely end your active Admin session. You will need to enter your credentials to log back in.
                </p>
              </div>

              <div className="modal-footer bg-light border-0 p-3 d-flex align-items-center justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm px-3.5 py-2 fw-semibold rounded-3"
                  onClick={() => setShowLogoutModal(false)}
                  disabled={loggingOut}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm px-4 py-2 fw-bold rounded-3 shadow-sm d-flex align-items-center gap-2"
                  onClick={confirmLogout}
                  disabled={loggingOut}
                >
                  {loggingOut ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                      Logging out...
                    </>
                  ) : (
                    <>
                      <FaSignOutAlt size={14} />
                      Yes, Logout
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
