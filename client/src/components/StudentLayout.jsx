import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import AICompanion from "../components/student/AICompanion";
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';

const StudentLayout = ({ children }) => {
  const location = useLocation();

  // Close the mobile drawer after navigation and when resizing up to desktop
  useEffect(() => {
    const closeDrawer = () => {
      const el = document.getElementById('studentSidebar');
      if (el) {
        const oc = bootstrap.Offcanvas.getInstance(el);
        if (oc) oc.hide();
      }
    };
    window.addEventListener('resize', closeDrawer);
    return () => window.removeEventListener('resize', closeDrawer);
  }, []);

  useEffect(() => {
    const el = document.getElementById('studentSidebar');
    if (el) {
      const oc = bootstrap.Offcanvas.getInstance(el);
      if (oc) oc.hide();
    }
  }, [location.pathname]);

  return (
    <div className="min-vh-100 bg-light d-flex flex-column position-relative">
      {/* SIDEBAR: offcanvas drawer below lg, pinned fixed 294px at lg+ */}
      <aside className="offcanvas offcanvas-start" id="studentSidebar" tabIndex="-1">
        <Sidebar />
      </aside>

      {/* MAIN CONTAINER (offset only on >= lg where the sidebar is pinned) */}
      <div className="d-flex flex-column vh-100 sidebar-content">
        {/* FIXED NAVBAR AT TOP */}
        <header className="flex-shrink-0" style={{ zIndex: 1010 }}>
          <Navbar drawerTarget="studentSidebar" />
        </header>

        {/* VERTICALLY SCROLLABLE MAIN CONTENT AREA */}
        <div className="flex-grow-1 overflow-y-auto overflow-x-hidden d-flex flex-column">
          <main className="px-3 px-md-4 pt-4 pb-4 flex-grow-1">
            {children}
          </main>
          <Footer />
          <AICompanion />
        </div>
      </div>
    </div>
  );
};

export default StudentLayout;