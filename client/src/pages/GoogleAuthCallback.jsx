import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const GoogleAuthCallback = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      window.location.replace('/login?google=error');
      return;
    }

    localStorage.setItem('studentToken', token);
    localStorage.removeItem('token'); // clean legacy key
    window.location.replace('/student/dashboard');
  }, [searchParams]);

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Completing Google sign-in...</span>
        </div>
        <p className="text-muted mt-3 mb-0">Completing Google sign-in...</p>
      </div>
    </div>
  );
};

export default GoogleAuthCallback;