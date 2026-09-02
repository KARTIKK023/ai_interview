import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaRobot, FaUser, FaSignOutAlt, FaPlusCircle, FaBriefcase, FaGraduationCap, FaShieldAlt } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = (user?.role || '').toLowerCase();

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark sticky-top px-3"
      style={{
        background: 'linear-gradient(90deg, #111827 0%, #1E1B4B 50%, #312E81 100%)',
        borderBottom: '1px solid rgba(99, 102, 241, 0.22)',
        boxShadow: '0 4px 20px -2px rgba(49, 46, 129, 0.4), 0 2px 10px rgba(0, 0, 0, 0.3)',
        zIndex: 1030
      }}
    >
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold text-white fs-4" to="/">
          <div className="bg-primary text-white rounded-3 p-2 d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px' }}>
            <FaRobot size={22} />
          </div>
          <span>HireSmart <span className="text-gradient">AI</span></span>
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-2">
            {!user && (
              <>
                <li className="nav-item">
                  <Link className="nav-link text-white-50" to="/">Home</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-white-50" to="/#features">Features</Link>
                </li>
              </>
            )}

            {user && (
              <li className="nav-item">
                <Link className="nav-link text-white d-flex align-items-center gap-1" to="/student/dashboard">
                  <FaGraduationCap /> Student Dashboard
                </Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {user ? (
              <div className="dropdown">
                <button
                  className="btn dropdown-toggle d-flex align-items-center gap-2 text-white shadow-sm"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{
                    backgroundColor: '#0B1026',
                    border: '1px solid transparent',
                    backgroundImage: 'linear-gradient(#0B1026, #0B1026), linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                    backgroundOrigin: 'border-box',
                    backgroundClip: 'padding-box, border-box',
                    borderRadius: '12px',
                    padding: '6px 14px',
                    boxShadow: '0 4px 15px -2px rgba(124, 58, 237, 0.35)',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <div
                    className="rounded-circle text-white d-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden"
                    style={{
                      width: '32px',
                      height: '32px',
                      background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                      boxShadow: '0 2px 8px rgba(124, 58, 237, 0.4)'
                    }}
                  >
                    {user?.profilePhoto || user?.profile?.profilePhoto ? (
                      <img
                        src={user.profilePhoto || user.profile.profilePhoto}
                        alt="User Avatar"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <FaUser size={14} />
                    )}
                  </div>

                  <span className="fw-semibold text-white">{user.fullName || user.name}</span>

                  <span
                    className="badge rounded-pill px-2.5 py-1 font-semibold text-white"
                    style={{
                      background: 'linear-gradient(135deg, #059669 0%, #0D9488 100%)',
                      fontSize: '0.7rem',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    Student
                  </span>
                </button>

                <ul
                  className="dropdown-menu dropdown-menu-dark dropdown-menu-end shadow-lg"
                  aria-labelledby="userDropdown"
                  style={{
                    backgroundColor: '#0B1026',
                    border: '1px solid rgba(124, 58, 237, 0.3)',
                    borderRadius: '14px',
                    boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 4px 20px rgba(124, 58, 237, 0.25)',
                    padding: '8px 0'
                  }}
                >
                  <li>
                    <span className="dropdown-item-text text-muted small px-3">{user.email}</span>
                  </li>
                  <li>
                    <Link className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 text-white" to="/student/profile">
                      <FaUser size={14} className="text-info" /> My Profile
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider my-1" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} /></li>
                  <li>
                    <button className="dropdown-item text-danger d-flex align-items-center gap-2 py-2 px-3 fw-semibold" onClick={handleLogout}>
                      <FaSignOutAlt /> Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-light btn-sm px-3">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm px-3 fw-bold">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
