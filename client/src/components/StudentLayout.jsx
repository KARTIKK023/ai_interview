import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import AICompanion from "../components/student/AICompanion";

const StudentLayout = ({ children }) => {
  return (
    <div className="min-vh-100 bg-light d-flex flex-column position-relative">
      {/* FIXED LEFT SIDEBAR (top: 0, left: 0, width: 294px, height: 100vh) */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '294px',
          height: '100vh',
          zIndex: 1020,
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        <Sidebar />
      </aside>

      {/* MAIN CONTAINER (Starts after 294px sidebar width) */}
      <div
        className="d-flex flex-column vh-100"
        style={{
          marginLeft: '294px',
          width: 'calc(100% - 294px)'
        }}
      >
        {/* FIXED NAVBAR AT TOP */}
        <header className="flex-shrink-0" style={{ zIndex: 1010 }}>
          <Navbar />
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
