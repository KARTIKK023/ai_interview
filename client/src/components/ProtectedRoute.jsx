import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    const userRole = (user.role || '').toLowerCase();
    const allowed = allowedRoles.map((r) => r.toLowerCase());

    if (!allowed.includes(userRole)) {
      if (userRole === 'super_admin' || userRole === 'admin') {
        return <Navigate to="/super-admin/dashboard" replace />;
      }
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
