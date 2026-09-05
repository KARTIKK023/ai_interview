import React, { useContext, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

import {
  FaTachometerAlt,
  FaHistory,
  FaChartLine,
  FaUser,
  FaBriefcase,
  FaFileAlt,
  FaGraduationCap,
  FaRobot,
  FaClock,
  FaBookOpen,
  FaAward,
  FaQuestionCircle
} from 'react-icons/fa';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  /* ============================================================
     PROFILE SECTION
  ============================================================ */

  const isProfileActive =
    location.pathname === '/student/profile' ||
    location.pathname === '/student/profile-progress';

  const [isProfileExpanded, setIsProfileExpanded] =
    useState(isProfileActive || false);

  /* ============================================================
     INTERVIEW PREPARATION SECTION
  ============================================================ */

  const isPrepActive =
    location.pathname.startsWith('/student/interview-preparation') ||
    location.pathname === '/student/interviews' ||
    location.pathname === '/student/analytics';

  const [isPrepExpanded, setIsPrepExpanded] =
    useState(isPrepActive || false);

  if (!user) return null;

  return (
    <div className="sidebar-wrapper d-flex flex-column">

      {/* ============================================================
          SIDEBAR TITLE
      ============================================================ */}

      <div className="mb-3 px-2">
        <h6
          className="text-uppercase text-white fw-bold small mb-0"
          style={{
            letterSpacing: '0.05em',
            color: '#ffffff',
            fontWeight: '700'
          }}
        >
          STUDENT WORKSPACE
        </h6>
      </div>


      {/* ============================================================
          NAVIGATION
      ============================================================ */}

      <nav className="sidebar-nav nav flex-column flex-grow-1">

        {/* ============================================================
            DASHBOARD
        ============================================================ */}

        <NavLink
          to="/student/dashboard"
          className={({ isActive }) =>
            `nav-link ${isActive ? 'active' : ''}`
          }
          style={{
            letterSpacing: '0.05em',
            fontWeight: '700'
          }}
        >
          <FaTachometerAlt />
          <span>Dashboard</span>
        </NavLink>


        {/* ============================================================
            PROFILE SECTION
        ============================================================ */}

        <div className="nav-item">

          <button
            type="button"
            className={`
              nav-link
              w-100
              text-start
              d-flex
              align-items-center
              justify-content-between
              border-0
              ${isProfileActive ? 'active' : ''}
            `}
            onClick={() =>
              setIsProfileExpanded(!isProfileExpanded)
            }
            style={{
              cursor: 'pointer',
              letterSpacing: '0.05em',
              fontWeight: '700'
            }}
          >

            <span className="d-flex align-items-center">
              <FaUser className="me-2" />
              Profile
            </span>

            <span className="small">
              {isProfileExpanded ? '▾' : '▸'}
            </span>

          </button>


          {/* PROFILE SUB MENU */}

          {isProfileExpanded && (
            <div className="ps-3 nav flex-column small mt-1">

              <NavLink
                to="/student/profile"
                className={({ isActive }) =>
                  `nav-link py-2 ps-3 d-flex align-items-center ${
                    isActive ? 'active' : ''
                  }`
                }
              >
                <FaUser className="me-2" />
                My Profile
              </NavLink>


              <NavLink
                to="/student/profile-progress"
                className={({ isActive }) =>
                  `nav-link py-2 ps-3 d-flex align-items-center ${
                    isActive ? 'active' : ''
                  }`
                }
              >
                <FaChartLine className="me-2" />
                Profile Progress
              </NavLink>

            </div>
          )}

        </div>


        {/* ============================================================
            MY RESUME
        ============================================================ */}

        <NavLink
          to="/student/resume"
          className={({ isActive }) =>
            `nav-link ${isActive ? 'active' : ''}`
          }
          style={{
            letterSpacing: '0.05em',
            fontWeight: '700'
          }}
        >
          <FaFileAlt />
          <span>My Resume</span>
        </NavLink>


        {/* ============================================================
            TARGET JOBS
        ============================================================ */}

        <NavLink
          to="/student/target-jobs"
          className={({ isActive }) =>
            `nav-link ${isActive ? 'active' : ''}`
          }
          style={{
            letterSpacing: '0.05em',
            fontWeight: '700'
          }}
        >
          <FaBriefcase />
          <span>Target Jobs</span>
        </NavLink>


        {/* ============================================================
            QUESTION BANK
        ============================================================ */}

        <NavLink
          to="/student/question-bank-reader"
          className={({ isActive }) =>
            `nav-link ${isActive ? 'active' : ''}`
          }
          style={{
            letterSpacing: '0.05em',
            fontWeight: '700'
          }}
        >
          <FaBookOpen />
          <span>Question Bank</span>
        </NavLink>


        {/* ============================================================
            INTERVIEW PREPARATION
        ============================================================ */}

        <div className="nav-item">

          <button
            type="button"
            className={`
              nav-link
              w-100
              text-start
              d-flex
              align-items-center
              justify-content-between
              border-0
              ${isPrepActive ? 'active' : ''}
            `}
            onClick={() =>
              setIsPrepExpanded(!isPrepExpanded)
            }
            style={{
              cursor: 'pointer',
              letterSpacing: '0.05em',
              fontWeight: '700'
            }}
          >

            <span className="d-flex align-items-center">
              <FaGraduationCap className="me-2" />
              Interview
            </span>

            <span className="small">
              {isPrepExpanded ? '▾' : '▸'}
            </span>

          </button>


          {/* INTERVIEW SUB MENU */}

          {isPrepExpanded && (
            <div className="ps-3 nav flex-column small mt-1">

              {/* AI MOCK INTERVIEW */}

              <NavLink
                to="/student/interview-preparation/ai-mock"
                className={({ isActive }) =>
                  `nav-link py-2 ps-3 d-flex align-items-center ${
                    isActive ? 'active' : ''
                  }`
                }
              >
                <FaRobot className="me-2" />
                AI Mock Interview
              </NavLink>


              {/* QUICK PRACTICE */}

              <NavLink
                to="/student/interview-preparation/quick-practice"
                className={({ isActive }) =>
                  `nav-link py-2 ps-3 d-flex align-items-center ${
                    isActive ? 'active' : ''
                  }`
                }
              >
                <FaClock className="me-2" />
                Quick 5-Min Practice
              </NavLink>


              {/* INTERVIEW HISTORY */}

              <NavLink
                to="/student/interviews"
                className={({ isActive }) =>
                  `nav-link py-2 ps-3 d-flex align-items-center ${
                    isActive ? 'active' : ''
                  }`
                }
              >
                <FaHistory className="me-2" />
                My Interviews History
              </NavLink>


              {/* PERFORMANCE ANALYTICS */}

              <NavLink
                to="/student/analytics"
                className={({ isActive }) =>
                  `nav-link py-2 ps-3 d-flex align-items-center ${
                    isActive ? 'active' : ''
                  }`
                }
              >
                <FaChartLine className="me-2" />
                Performance Analytics
              </NavLink>

            </div>
          )}

        </div>


        {/* ============================================================
            CERTIFICATES
        ============================================================ */}

        <NavLink
          to="/student/achievements"
          className={({ isActive }) =>
            `nav-link ${isActive ? 'active' : ''}`
          }
          style={{
            letterSpacing: '0.05em',
            fontWeight: '700'
          }}
        >
          <FaAward />
          <span>Certificates</span>
        </NavLink>


        {/* ============================================================
            PLACEMENTS
        ============================================================ */}

        <NavLink
          to="/student/placement-opportunities"
          className={({ isActive }) =>
            `nav-link ${isActive ? 'active' : ''}`
          }
          style={{
            letterSpacing: '0.05em',
            fontWeight: '700'
          }}
        >
          <FaBriefcase />
          <span>Placements</span>
        </NavLink>


        {/* ============================================================
            ASK AI
        ============================================================ */}

        <NavLink
          to="/student/ask"
          className={({ isActive }) =>
            `nav-link ${isActive ? 'active' : ''}`
          }
          style={{
            letterSpacing: '0.05em',
            fontWeight: '700'
          }}
        >
          <FaRobot />
          <span>Ask AI</span>
        </NavLink>


        {/* ============================================================
            HELP & SUPPORT
        ============================================================ */}

        <NavLink
          to="/student/help-support"
          className={({ isActive }) =>
            `nav-link ${isActive ? 'active' : ''}`
          }
          style={{
            letterSpacing: '0.05em',
            fontWeight: '700'
          }}
        >
          <FaQuestionCircle />
          <span>Help & Support</span>
        </NavLink>

      </nav>


      {/* ============================================================
          ACTIVE SIDEBAR STYLING
      ============================================================ */}

      <style>{`

        /* ------------------------------------------------------------
           NORMAL NAV ITEM
        ------------------------------------------------------------ */

        .sidebar-nav .nav-link {
          color: #ffffff !important;

          transition:
            background-color 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;

          border-radius: 8px;
        }


        /* ------------------------------------------------------------
           HOVER
        ------------------------------------------------------------ */

        .sidebar-nav .nav-link:hover {
          background-color: rgba(255, 255, 255, 0.10);
          color: #ffffff !important;
        }


        /* ------------------------------------------------------------
           ACTIVE ITEM
        ------------------------------------------------------------ */

        .sidebar-nav .nav-link.active {
          background-color: #ffffff !important;
          color: #000000 !important;

          border-radius: 8px;

          box-shadow:
            0 2px 8px rgba(0, 0, 0, 0.08);
        }


        /* ------------------------------------------------------------
           ACTIVE ICON
        ------------------------------------------------------------ */

        .sidebar-nav .nav-link.active svg {
          color: #000000 !important;
        }


        /* ------------------------------------------------------------
           ACTIVE ITEM HOVER
        ------------------------------------------------------------ */

        .sidebar-nav .nav-link.active:hover {
          background-color: #ffffff !important;
          color: #000000 !important;

          transform: translateX(2px);
        }


        /* ------------------------------------------------------------
           SUB NAV LINKS
        ------------------------------------------------------------ */

        .sidebar-nav .nav-item .nav-link {
          margin-bottom: 2px;
        }


        /* ------------------------------------------------------------
           SUB NAV ACTIVE
        ------------------------------------------------------------ */

        .sidebar-nav .nav-item .nav-link.active {
          background-color: #ffffff !important;
          color: #000000 !important;
        }


        /* ------------------------------------------------------------
           BUTTON RESET
        ------------------------------------------------------------ */

        .sidebar-nav button.nav-link {
          font-family: inherit;
        }


        /* ------------------------------------------------------------
           BUTTON ACTIVE TEXT
        ------------------------------------------------------------ */

        .sidebar-nav button.nav-link.active span,
        .sidebar-nav button.nav-link.active {
          color: #000000 !important;
        }


        /* ------------------------------------------------------------
           BUTTON ACTIVE ICON
        ------------------------------------------------------------ */

        .sidebar-nav button.nav-link.active svg {
          color: #000000 !important;
        }

      `}</style>

    </div>
  );
};

export default Sidebar;