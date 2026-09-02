import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../services/api';
import toast from 'react-hot-toast';
import {
  FaRobot,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaKey,
  FaExclamationCircle,
  FaCheckCircle
} from 'react-icons/fa';

const Register = () => {
  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // States
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Resend Countdown Timer
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Handle Send / Resend OTP
  const handleSendOtp = async () => {
    setError('');

    if (!email.trim()) {
      const msg = 'Email is required';
      setError(msg);
      toast.error(msg);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      const msg = 'Invalid email';
      setError(msg);
      toast.error(msg);
      return;
    }

    setSendingOtp(true);

    try {
      const res = await API.post('/auth/send-otp', {
        fullName: fullName.trim() || 'Student',
        email: email.trim()
      });

      if (res.data.success) {
        setOtpSent(true);
        setResendTimer(60);
        toast.success(res.data.message || 'OTP sent successfully to your email');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP';
      setError(msg);
      toast.error(msg);
    } finally {
      setSendingOtp(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async () => {
    setError('');

    if (!otp || otp.trim().length !== 6) {
      const msg = 'Please enter a 6-digit OTP';
      setError(msg);
      toast.error(msg);
      return;
    }

    setVerifyingOtp(true);

    try {
      const res = await API.post('/auth/verify-otp', {
        email: email.trim(),
        otp: otp.trim()
      });

      if (res.data.success) {
        setEmailVerified(true);
        toast.success('Email verified successfully');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid OTP';
      setError(msg);
      toast.error(msg);
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Create Account Submit Handler
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setError('');

    // CHECK 1: Email Verification MUST BE FIRST!
    if (!emailVerified) {
      const msg = 'Please verify your email before creating your account.';
      setError(msg);
      toast.error(msg);
      return;
    }

    // CHECK 2: Validate Full Name
    if (!fullName.trim()) {
      const msg = 'Full name is required';
      setError(msg);
      toast.error(msg);
      return;
    }

    // CHECK 3: Validate Email
    if (!email.trim()) {
      const msg = 'Email is required';
      setError(msg);
      toast.error(msg);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      const msg = 'Invalid email';
      setError(msg);
      toast.error(msg);
      return;
    }

    // CHECK 4: Validate Mobile Number
    if (!mobileNumber.trim()) {
      const msg = 'Mobile number is required';
      setError(msg);
      toast.error(msg);
      return;
    }

    // CHECK 5: Validate Password
    if (!password) {
      const msg = 'Password is required';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (password.length < 8) {
      const msg = 'Password must be at least 8 characters';
      setError(msg);
      toast.error(msg);
      return;
    }

    // CHECK 6: Validate Confirm Password
    if (password !== confirmPassword) {
      const msg = 'Passwords do not match';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);

    try {
      const res = await API.post('/auth/register', {
        fullName: fullName.trim(),
        email: email.trim(),
        mobileNumber: mobileNumber.trim(),
        password,
        confirmPassword,
        otp: otp.trim(),
        role: 'student'
      });

      if (res.data.success) {
        toast.success('Registration successful');
        navigate('/login');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Navbar />

      <div className="container my-auto py-5">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8 col-sm-10">
            <div className="card card-custom p-4 shadow-sm border-0">
              {/* Branding Header */}
              <div className="text-center mb-4">
                <div className="bg-primary text-white rounded-3 p-3 d-inline-flex mb-2 shadow-sm">
                  <FaRobot size={32} />
                </div>
                <h3 className="fw-bold mb-1">AI Interview Platform</h3>
                <h5 className="text-primary fw-semibold mb-1">Create Account</h5>
                <p className="text-muted small mb-0">Start your AI interview journey</p>
              </div>

              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 small mb-3">
                  <FaExclamationCircle className="flex-shrink-0" /> <div>{error}</div>
                </div>
              )}

              {/* Complete Form - All Fields Always Visible */}
              <form onSubmit={handleCreateAccount} noValidate>
                {/* 1. Full Name */}
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Full Name</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted"><FaUser /></span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* 2. Email Address + Send OTP Button */}
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted"><FaEnvelope /></span>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailVerified) setEmailVerified(false);
                        if (otpSent) setOtpSent(false);
                      }}
                      disabled={emailVerified || sendingOtp || loading}
                    />
                    {!emailVerified && (
                      <button
                        type="button"
                        className="btn btn-primary fw-semibold px-3"
                        onClick={handleSendOtp}
                        disabled={sendingOtp || !email || resendTimer > 0 || loading}
                      >
                        {sendingOtp ? (
                          'Sending...'
                        ) : resendTimer > 0 ? (
                          `Resend in ${resendTimer}s`
                        ) : otpSent ? (
                          'Resend OTP'
                        ) : (
                          'Send OTP'
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Email Verified Banner / OTP Verification Section */}
                {emailVerified ? (
                  <div className="alert alert-success d-flex align-items-center gap-2 small py-2 mb-3 fw-bold">
                    <FaCheckCircle className="text-success fs-5" /> ✓ Email Verified Successfully
                  </div>
                ) : (
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">OTP Code</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light text-muted"><FaKey /></span>
                      <input
                        type="text"
                        className="form-control font-monospace fw-bold"
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        disabled={verifyingOtp || loading}
                      />
                      <button
                        type="button"
                        className="btn btn-success fw-bold px-3"
                        onClick={handleVerifyOtp}
                        disabled={verifyingOtp || otp.length !== 6 || loading}
                      >
                        {verifyingOtp ? 'Verifying...' : 'Verify OTP'}
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. Mobile Number */}
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Mobile Number</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted"><FaPhone /></span>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="Enter your mobile number"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* 4. Password */}
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Password (Min. 8 characters)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted"><FaLock /></span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* 5. Confirm Password */}
                <div className="mb-4">
                  <label className="form-label fw-semibold small">Confirm Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted"><FaLock /></span>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="form-control"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* 6. Create Account Button - ALWAYS VISIBLE */}
                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2.5 fw-bold shadow-sm mb-3"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              <div className="text-center mt-3 border-top pt-3">
                <p className="text-muted small mb-0">
                  Already have an account? <Link to="/login" className="fw-bold text-primary">Login</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
