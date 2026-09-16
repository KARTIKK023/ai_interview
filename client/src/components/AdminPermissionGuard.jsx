import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';

const AdminPermissionGuard = ({ featureKey, children }) => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const verifyPermission = async () => {
      const token = localStorage.getItem('superAdminToken') || localStorage.getItem('adminToken') || localStorage.getItem('token');
      if (!token) {
        setIsAuthorized(false);
        setIsVerifying(false);
        return;
      }

      try {
        const res = await API.get('/admin/me');
        if (res.data && res.data.success && res.data.user) {
          const user = res.data.user;
          const roleUpper = (user.role || '').toUpperCase();

          // Super Admin has full unrestricted access
          if (roleUpper === 'SUPER_ADMIN') {
            setIsAuthorized(true);
          } else if (roleUpper === 'ADMIN') {
            const permissions = user.permissions || [];
            
            if (featureKey === 'dashboard' || permissions.includes(featureKey)) {
              setIsAuthorized(true);
            } else {
              toast.error('You do not have permission to access this feature.');
              setIsAuthorized(false);
            }
          } else {
            toast.error('Access denied. Admin privileges required.');
            setIsAuthorized(false);
          }
        } else {
          setIsAuthorized(false);
        }
      } catch (err) {
        console.error('Permission verification failed:', err);
        setIsAuthorized(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPermission();
  }, [featureKey]);

  if (isVerifying) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light text-dark">
        <div className="text-center">
          <div className="spinner-border text-purple mb-3" style={{ width: '3rem', height: '3rem', color: '#6D28D9' }} role="status">
            <span className="visually-hidden">Verifying Permissions...</span>
          </div>
          <h6 className="fw-bold text-muted mb-0">Checking Feature Authorization...</h6>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default AdminPermissionGuard;
