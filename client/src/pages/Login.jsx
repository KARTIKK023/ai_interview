import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { FaRobot, FaLock, FaEnvelope, FaExclamationCircle } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.user) {
        navigate('/student/dashboard');
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || 'Login failed. Please check your credentials.');
      } else {
        setError('Cannot connect to backend server. Please ensure Node.js server is running on port 5000.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Navbar />

      <div className="container my-auto py-5">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card card-custom p-4 shadow-sm">
              <div className="text-center mb-4">
                <div className="bg-primary text-white rounded-circle p-3 d-inline-flex mb-2">
                  <FaRobot size={28} />
                </div>
                <h4 className="fw-bold">Welcome Back</h4>
                <p className="text-muted small">Sign in to access your interview workspace</p>
              </div>

              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 small mb-3">
                  <FaExclamationCircle /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted"><FaEnvelope /></span>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold small">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted"><FaLock /></span>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary-custom w-100 mb-3" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <div className="text-center mt-3 border-top pt-3">
                <p className="text-muted small mb-1">
                  Don't have an account? <Link to="/register" className="fw-bold text-primary">Register Now</Link>
                </p>
                {/* <div className="text-muted small mt-2">
                  <strong>Demo Accounts:</strong><br/>
                  Student: <code>student@aiinterview.com</code> / <code>student123</code><br/>
                  HR: <code>hr@aiinterview.com</code> / <code>hr12345</code><br/>
                  Admin: <code>admin@aiinterview.com</code> / <code>admin123</code>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
