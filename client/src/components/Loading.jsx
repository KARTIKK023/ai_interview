import React from 'react';
import { FaRobot } from 'react-icons/fa';

const Loading = ({ message = 'Evaluating response with AI...' }) => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center p-5 text-center">
      <div className="bg-primary text-white rounded-circle p-3 mb-3 shadow animate-bounce">
        <FaRobot size={36} />
      </div>
      <div className="spinner-border text-primary mb-3" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <h6 className="fw-bold text-dark">{message}</h6>
      <p className="text-muted small">AI engine is processing role-specific criteria and generating insights.</p>
    </div>
  );
};

export default Loading;
