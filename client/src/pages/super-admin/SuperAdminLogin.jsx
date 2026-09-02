import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import {
  FaShieldAlt,
  FaLock,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaExclamationTriangle,
  FaCheckCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const SuperAdminLogin = () => {
  const navigate = useNavigate();
  const { setUser, token } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // If already authenticated as Super Admin, redirect immediately
  React.useEffect(() => {
    const existingToken = localStorage.getItem('superAdminToken');
    if (existingToken) {
      API.get('/admin/me')
        .then((res) => {
          if (res.data.success && (res.data.user?.role || '').toUpperCase() === 'SUPER_ADMIN') {
            localStorage.setItem('superAdminUser', JSON.stringify(res.data.user));
            navigate('/super-admin/dashboard', { replace: true });
          }
        })
        .catch(() => {
          localStorage.removeItem('superAdminToken');
          localStorage.removeItem('superAdminUser');
        });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMessage('Please enter both admin email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await API.post('/admin/login', {
        email: cleanEmail,
        password
      });

      if (res.data && res.data.success && res.data.token) {
        // Save Super Admin token & user profile independently
        localStorage.setItem('superAdminToken', res.data.token);
        localStorage.setItem('superAdminUser', JSON.stringify(res.data.user));

        toast.success('Super Admin authentication successful!');
        navigate('/super-admin/dashboard', { replace: true });
      } else {
        setErrorMessage(res.data.message || 'Super Admin login failed.');
      }
    } catch (err) {
      console.error('Super Admin Login Error:', err);
      const msg = err.response?.data?.message || 'Invalid admin credentials or network error.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center p-3 position-relative overflow-hidden"
      style={{
        backgroundColor: '#F5F7FB',
        backgroundImage: 'radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.12) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.12) 0px, transparent 50%), radial-gradient(at 50% 50%, rgba(59, 130, 246, 0.08) 0px, transparent 50%)',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      <div className="w-100" style={{ maxWidth: '440px' }}>
        {/* CARD CONTAINER */}
        <div
          className="card border-0 text-white p-4 p-sm-4.5"
          style={{
            background: 'linear-gradient(145deg, #28245A 0%, #1E1A46 100%)',
            borderRadius: '20px',
            border: '1px solid rgba(129, 140, 248, 0.35)',
            boxShadow: '0 20px 50px rgba(36, 32, 82, 0.45), 0 0 30px rgba(99, 102, 241, 0.25)'
          }}
        >
          {/* HEADER LOGO & BADGE */}
          <div className="text-center mb-4">
            <div
              className="d-inline-flex p-3 rounded-circle text-white mb-3 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', boxShadow: '0 0 20px rgba(124, 58, 237, 0.4)' }}
            >
              <FaShieldAlt size={32} />
            </div>

            <h3 className="fw-extrabold text-white mb-1" style={{ letterSpacing: '-0.5px' }}>
              Super Admin Console
            </h3>
            <p className="small mb-0" style={{ color: '#C7D2FE' }}>
              HireSmart AI Master Administrator Authentication
            </p>
          </div>

          {/* ERROR ALERT BANNER */}
          {errorMessage && (
            <div className="alert alert-danger bg-danger bg-opacity-20 border border-danger border-opacity-30 text-white small p-3 rounded-3 mb-4 d-flex align-items-start gap-2">
              <FaExclamationTriangle className="text-danger flex-shrink-0 mt-0.5" size={16} />
              <div>
                <strong className="d-block">Authentication Error</strong>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* LOGIN FORM */}
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="mb-3.5">
              <label className="form-label fw-semibold small mb-1.5" style={{ color: '#E0E7FF' }}>
                Admin Email Address
              </label>
              <div className="position-relative">
                <FaEnvelope className="position-absolute start-0 top-50 translate-middle-y ms-3" style={{ color: '#A5B4FC' }} size={15} />
                <input
                  type="email"
                  className="form-control text-white ps-5 py-2.5 rounded-3 fw-medium"
                  placeholder="superadmin@hiresmart.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  style={{
                    background: 'rgba(15, 13, 38, 0.65)',
                    border: '1px solid rgba(129, 140, 248, 0.35)',
                    color: '#FFFFFF',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="mb-4">
              <label className="form-label fw-semibold small mb-1.5" style={{ color: '#E0E7FF' }}>
                Master Password
              </label>
              <div className="position-relative">
                <FaLock className="position-absolute start-0 top-50 translate-middle-y ms-3" style={{ color: '#A5B4FC' }} size={15} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control text-white ps-5 pe-5 py-2.5 rounded-3 fw-medium"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{
                    background: 'rgba(15, 13, 38, 0.65)',
                    border: '1px solid rgba(129, 140, 248, 0.35)',
                    color: '#FFFFFF',
                    fontSize: '0.9rem'
                  }}
                />
                <button
                  type="button"
                  className="btn btn-link position-absolute end-0 top-50 translate-middle-y me-2 p-1 border-0"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                  style={{ color: '#A5B4FC' }}
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-100 py-2.5 fw-bold rounded-3 d-flex align-items-center justify-content-center gap-2 shadow-lg mb-3"
              style={{
                background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
                border: 'none',
                fontSize: '0.95rem'
              }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Authenticating...
                </>
              ) : (
                <>
                  Access Master Console <FaArrowRight size={14} />
                </>
              )}
            </button>
          </form>

         
        </div>
       
      </div>
    </div>
  );
};

export default SuperAdminLogin;
