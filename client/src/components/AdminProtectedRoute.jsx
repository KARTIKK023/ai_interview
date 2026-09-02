import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';

const AdminProtectedRoute = ({ children }) => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const verifySuperAdmin = async () => {
      const superAdminTok = localStorage.getItem('superAdminToken');
      if (!superAdminTok) {
        setIsAuthorized(false);
        setIsVerifying(false);
        return;
      }

      try {
        const res = await API.get('/admin/me');
        if (res.data && res.data.success && res.data.user) {
          const roleUpper = (res.data.user.role || '').toUpperCase();
          if (roleUpper === 'SUPER_ADMIN') {
            localStorage.setItem('superAdminUser', JSON.stringify(res.data.user));
            setIsAuthorized(true);
          } else {
            toast.error('Access denied. Super Admin privileges required.');
            setIsAuthorized(false);
          }
        } else {
          setIsAuthorized(false);
        }
      } catch (err) {
        console.error('Super Admin session verification failed:', err);
        localStorage.removeItem('superAdminToken');
        localStorage.removeItem('superAdminUser');
        setIsAuthorized(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifySuperAdmin();
  }, []);

  if (isVerifying) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-dark text-white">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Authenticating Super Admin...</span>
          </div>
          <h6 className="fw-bold text-white-50 mb-0">Verifying Master Admin Privileges...</h6>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/super-admin/login" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
