import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from '../pages/admin/AdminSidebar';
import { FaBars, FaShieldAlt, FaChevronDown } from 'react-icons/fa';
import API from '../services/api';
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminUser, setAdminUser] = useState(null);

  // Close the mobile drawer after navigation and when resizing up to desktop
  useEffect(() => {
    const closeDrawer = () => {
      const el = document.getElementById('adminSidebar');
      if (el) {
        const oc = bootstrap.Offcanvas.getInstance(el);
        if (oc) oc.hide();
      }
    };
    window.addEventListener('resize', closeDrawer);
    return () => window.removeEventListener('resize', closeDrawer);
  }, []);

  useEffect(() => {
    const el = document.getElementById('adminSidebar');
    if (el) {
      const oc = bootstrap.Offcanvas.getInstance(el);
      if (oc) oc.hide();
    }
  }, [location.pathname]);

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      // First try stored local user
      const stored = localStorage.getItem('adminUser') || localStorage.getItem('superAdminUser');
      if (stored) {
        setAdminUser(JSON.parse(stored));
      }

      const meRes = await API.get('/admin/me').catch(() => null);
      if (meRes && meRes.data && meRes.data.success) {
        setAdminUser(meRes.data.user);
        localStorage.setItem('adminUser', JSON.stringify(meRes.data.user));
      }
    } catch (err) {
      console.error('Failed to load admin profile in layout:', err);
    }
  };

  const isSuperAdmin = (adminUser?.role || '').toUpperCase() === 'SUPER_ADMIN';
  const userName = adminUser?.username || adminUser?.fullName || adminUser?.name || 'Admin User';
  const roleName = isSuperAdmin ? 'Super Admin' : 'Admin';

  return (
    <div
      className="admin-layout vh-100 d-flex flex-column overflow-hidden"
      style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#F8F9FD' }}
    >
      {/* 1. TOP HEADER NAVBAR */}
      <header
        className="px-4 py-2.5 d-flex align-items-center justify-content-between shadow-sm flex-shrink-0 z-3"
        style={{
          background: '#350B6D',
          color: '#FFFFFF',
          minHeight: '60px'
        }}
      >
        {/* Left Header Info */}
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn border-0 text-white p-1 d-flex align-items-center d-lg-none"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#adminSidebar"
            aria-controls="adminSidebar"
            aria-label="Open navigation menu"
          >
            <FaBars size={18} />
          </button>
          <span className="text-white-50 font-monospace">|</span>

          <div
            className="d-flex align-items-center gap-2 cursor-pointer"
            onClick={() => navigate('/admin/dashboard')}
          >
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '32px', height: '32px', background: 'rgba(255, 255, 255, 0.15)' }}
            >
              <FaShieldAlt className="text-white" size={16} />
            </div>
            <h6 className="fw-bold mb-0 text-white" style={{ fontSize: '0.95rem' }}>
              Admin Dashboard
            </h6>
          </div>
        </div>

        {/* Right Header User Controls */}
        <div className="d-flex align-items-center gap-3">
          {/* Dynamic Profile Avatar & Name */}
          <div className="d-flex align-items-center gap-2 cursor-pointer">
            {adminUser?.profilePhoto || adminUser?.profile?.profilePhoto ? (
              <img
                src={adminUser.profilePhoto || adminUser.profile?.profilePhoto}
                alt={userName}
                className="rounded-circle shadow-sm border border-white border-opacity-25"
                style={{ width: '36px', height: '36px', objectFit: 'cover' }}
              />
            ) : (
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                style={{
                  width: '36px',
                  height: '36px',
                  background: 'rgba(255, 255, 255, 0.25)',
                  fontSize: '0.9rem',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="text-start leading-tight">
              <span className="fw-bold d-block text-white" style={{ fontSize: '0.85rem' }}>
                {userName}
              </span>
              <span className="text-white-50 d-block" style={{ fontSize: '0.7rem' }}>
                {roleName}
              </span>
            </div>
            <FaChevronDown size={11} className="text-white-50 ms-1" />
          </div>
        </div>
      </header>

      {/* 2. MIDDLE BODY CONTAINER (DRAWER / PINNED SIDEBAR + SCROLLABLE MAIN OUTLET) */}
      <div className="d-flex flex-grow-1 overflow-hidden">
        {/* SIDEBAR: offcanvas drawer below lg, pinned 250px below the header at lg+ */}
        <aside className="offcanvas offcanvas-start" id="adminSidebar" tabIndex="-1">
          <AdminSidebar />
        </aside>

        {/* MAIN OUTLET & FOOTER */}
        <main className="flex-grow-1 d-flex flex-column overflow-hidden h-100 admin-main">
          <div className="flex-grow-1 overflow-y-auto">
            <Outlet />
          </div>

          {/* FOOTER BAR */}
          <footer className="px-4 py-3 border-top mt-auto bg-white d-flex flex-column flex-sm-row align-items-center justify-content-between text-muted small flex-shrink-0">
            <span>© 2026 HireSmart AI. All rights reserved.</span>
            <div className="d-flex align-items-center gap-3 mt-2 mt-sm-0">
              <a href="#" className="text-muted text-decoration-none">Terms</a>
              <a href="#" className="text-muted text-decoration-none">Privacy</a>
              <a href="#" className="text-muted text-decoration-none">Help</a>
              <a href="#" className="text-muted text-decoration-none">Contact</a>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
