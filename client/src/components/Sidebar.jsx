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

  const isProfileActive =
    location.pathname === '/student/profile' ||
    location.pathname === '/student/profile-progress';
  const [isProfileExpanded, setIsProfileExpanded] = useState(isProfileActive || false);

  const isPrepActive =
    location.pathname.startsWith('/student/interview-preparation') ||
    location.pathname === '/student/interviews' ||
    location.pathname === '/student/analytics';
  const [isPrepExpanded, setIsPrepExpanded] = useState(isPrepActive || false);

  if (!user) return null;

  return (
    <div className="sidebar-wrapper d-flex flex-column">
      <div className="mb-3 px-2">
        <h6 className="text-uppercase text-white fw-bold small mb-0" style={{ letterSpacing: '0.05em' , color:'#ffffff' , fontWeight:'700' }}>
          STUDENT WORKSPACE
        </h6>
      </div>

      <nav className="sidebar-nav nav flex-column flex-grow-1">
        <NavLink to="/student/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        style={{ letterSpacing: '0.05em' , color:'#ffffff' , fontWeight:'700' }}
        >
          <FaTachometerAlt /> Dashboard
        </NavLink>

        {/* EXPANDABLE PROFILE SECTION */}
        <div className="nav-item">
          <button
            type="button"
            className={`nav-link w-100 text-start d-flex align-items-center justify-content-between border-0 ${isProfileActive ? 'active' : ''}`}
            onClick={() => setIsProfileExpanded(!isProfileExpanded)}
            style={{ cursor: 'pointer' }}
            
          >
            <span style={{ letterSpacing: '0.05em' , color:'#ffffff' , fontWeight:'700' }}>
              <FaUser className="me-2" /> Profile
            </span>
            <span className="small">{isProfileExpanded ? '▾' : '▸'}</span>
          </button>

          {isProfileExpanded && (
            <div className="ps-3 nav flex-column small mt-1">
              <NavLink
                to="/student/profile"
                className={({ isActive }) => `nav-link py-2 ps-3 d-flex align-items-center ${isActive ? 'active' : ''}`}
              >
                <FaUser className="me-2" /> My Profile
              </NavLink>
              <NavLink
                to="/student/profile-progress"
                className={({ isActive }) => `nav-link py-2 ps-3 d-flex align-items-center ${isActive ? 'active' : ''}`}
              >
                <FaChartLine className="me-2" /> Profile Progress
              </NavLink>
            </div>
          )}
        </div>

        <NavLink to="/student/resume" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        style={{ letterSpacing: '0.05em' , color:'#ffffff' , fontWeight:'700' }}
        >
          <FaFileAlt /> My Resume
        </NavLink>
        <NavLink to="/student/target-jobs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        style={{ letterSpacing: '0.05em' , color:'#ffffff' , fontWeight:'700' }}
        >
          <FaBriefcase /> Target Jobs
        </NavLink>
        <NavLink to="/student/question-bank-reader" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        style={{ letterSpacing: '0.05em' , color:'#ffffff' , fontWeight:'700' }}
        >
          <FaBookOpen /> Question Bank
        </NavLink>
        {/* EXPANDABLE INTERVIEW PREPARATION */}
        <div className="nav-item">
          <button
            type="button"
            className={`nav-link w-100 text-start d-flex align-items-center justify-content-between border-0 ${isPrepActive ? 'active' : ''}`}
            onClick={() => setIsPrepExpanded(!isPrepExpanded)}
            style={{ cursor: 'pointer' }}
          >
            <span style={{ letterSpacing: '0.05em' , color:'#ffffff' , fontWeight:'700' }}>
              <FaGraduationCap className="me-2" /> Interview 
            </span>
            <span className="small">{isPrepExpanded ? '▾' : '▸'}</span>
          </button>

          {isPrepExpanded && (
            <div className="ps-3 nav flex-column small mt-1">
              <NavLink
                to="/student/interview-preparation/ai-mock"
                className={({ isActive }) => `nav-link py-2 ps-3 d-flex align-items-center ${isActive ? 'active' : ''}`}

              >
                <FaRobot className="me-2" /> AI Mock Interview
              </NavLink>
              <NavLink
                to="/student/interview-preparation/quick-practice"
                className={({ isActive }) => `nav-link py-2 ps-3 d-flex align-items-center ${isActive ? 'active' : ''}`}
              >
                <FaClock className="me-2" /> Quick 5-Min Practice
              </NavLink>
              <NavLink
                to="/student/interviews"
                className={({ isActive }) => `nav-link py-2 ps-3 d-flex align-items-center ${isActive ? 'active' : ''}`}
              >
                <FaHistory className="me-2" /> My Interviews History
              </NavLink>
              <NavLink
                to="/student/analytics"
                className={({ isActive }) => `nav-link py-2 ps-3 d-flex align-items-center ${isActive ? 'active' : ''}`}
              >
                <FaChartLine className="me-2" /> Performance Analytics
              </NavLink>
            </div>
          )}
        </div>

        <NavLink to="/student/achievements" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        style={{ letterSpacing: '0.05em' , color:'#ffffff' , fontWeight:'700' }}
        >
          <FaAward /> Certificates
        </NavLink>
        <NavLink to="/student/placement-opportunities" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        style={{ letterSpacing: '0.05em' , color:'#ffffff' , fontWeight:'700' }}
        >
          <FaBriefcase /> Placements
        </NavLink>
        <NavLink to="/student/help-support" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        style={{ letterSpacing: '0.05em' , color:'#ffffff' , fontWeight:'700' }}
        >

          <FaQuestionCircle /> Help & Support
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
