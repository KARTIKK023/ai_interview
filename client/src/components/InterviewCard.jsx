import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaLaptopCode,
  FaUserTie,
  FaVideo,
  FaFont,
  FaClock,
  FaCalendarAlt,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle
} from 'react-icons/fa';

const pastelBgColors = ['#F0F7FF', '#F0FCFF', '#F7F3FF', '#F0FDF7'];

const formatDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  const day = d.getDate();
  const month = d.toLocaleString('en-US', { month: 'short' });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

const InterviewCard = ({ interview, index, cardBg }) => {
  if (!interview) return null;

  const isCompleted = interview.status === 'Completed';
  const isStopped = interview.status === 'Stopped';

  const isTechnical = interview.category === 'Technical';
  const isVideo = interview.mode === 'Video';

  const bg = cardBg || (typeof index === 'number' ? pastelBgColors[index % pastelBgColors.length] : '#F0F7FF');

  const interviewDate = formatDate(interview.completedAt || interview.startedAt || interview.createdAt);

  return (
    <div
      className="card card-custom h-100 p-3 border"
      style={{
        backgroundColor: bg,
        borderColor: '#e2e8f0',
        borderRadius: '16px',
        boxShadow: '0 6px 20px -4px rgba(99, 102, 241, 0.09), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease'
      }}
    >
      {/* BADGES ROW */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        {/* Technical -> Blue */}
        <span
          className="badge px-2.5 py-1.5 d-inline-flex align-items-center gap-1"
          style={{
            backgroundColor: isTechnical ? '#eff6ff' : '#f8fafc',
            color: isTechnical ? '#2563eb' : '#475569',
            border: `1px solid ${isTechnical ? '#bfdbfe' : '#e2e8f0'}`,
            fontSize: '0.725rem',
            fontWeight: 600,
            borderRadius: '6px'
          }}
        >
          {isTechnical ? <FaLaptopCode size={12} /> : <FaUserTie size={12} />}
          {interview.category || 'General'}
        </span>

        {/* Video -> Red, Text -> Cyan */}
        <span
          className="badge px-2.5 py-1.5 d-inline-flex align-items-center gap-1"
          style={{
            backgroundColor: isVideo ? '#fef2f2' : '#ecfeff',
            color: isVideo ? '#dc2626' : '#0891b2',
            border: `1px solid ${isVideo ? '#fecaca' : '#a5f3fc'}`,
            fontSize: '0.725rem',
            fontWeight: 600,
            borderRadius: '6px'
          }}
        >
          {isVideo ? <FaVideo size={11} /> : <FaFont size={11} />}
          {interview.mode || 'Text'}
        </span>
      </div>

      {/* JOB ROLE & TITLE */}
      <h6 className="fw-bold text-dark mb-1 text-truncate" title={interview.jobRole} style={{ fontSize: '1rem' }}>
        {interview.jobRole}
      </h6>
      <p className="text-muted small mb-3 text-truncate" title={interview.title} style={{ fontSize: '0.825rem' }}>
        {interview.title}
      </p>

      {/* DURATION, DATE & DIFFICULTY */}
      <div className="d-flex align-items-center flex-wrap gap-2 text-muted extra-small mb-3" style={{ fontSize: '0.775rem' }}>
        <span className="d-flex align-items-center gap-1">
          <FaClock size={12} className="text-muted" /> {interview.duration || 30} mins
        </span>

        {interviewDate && (
          <span className="d-flex align-items-center gap-1 text-muted">
            <FaCalendarAlt size={11} className="text-muted" /> {interviewDate}
          </span>
        )}

        <span className="badge bg-light text-secondary border fw-normal ms-auto" style={{ fontSize: '0.7rem' }}>
          {interview.difficulty || 'Intermediate'}
        </span>
      </div>

      {/* FOOTER: STATUS / SCORE & PRIMARY BUTTON */}
      <div className="d-flex align-items-center justify-content-between pt-3 border-top mt-auto" style={{ borderColor: '#f1f5f9' }}>
        <div>
          {isCompleted ? (
            /* Completed/Score -> Green */
            <div className="d-flex align-items-center gap-1 fw-bold" style={{ color: '#16a34a', fontSize: '0.875rem' }}>
              <FaCheckCircle size={14} />
              <span>{interview.score ?? interview.percentage ?? 0}% Score</span>
            </div>
          ) : isStopped ? (
            /* Stopped -> Amber */
            <div className="d-flex align-items-center gap-1 fw-semibold" style={{ color: '#d97706', fontSize: '0.85rem' }}>
              <FaTimesCircle size={14} />
              <span>Stopped</span>
            </div>
          ) : (
            /* In Progress -> Purple */
            <div className="d-flex align-items-center gap-1 fw-semibold" style={{ color: '#9333ea', fontSize: '0.85rem' }}>
              <FaHourglassHalf size={14} />
              <span>{interview.status || 'In Progress'}</span>
            </div>
          )}
        </div>

        <div>
          {isCompleted ? (
            /* Primary button -> Blue */
            <Link
              to={`/student/result/${interview._id}`}
              className="btn btn-sm fw-bold px-3 py-1.5"
              style={{
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                fontSize: '0.785rem'
              }}
            >
              View Report
            </Link>
          ) : (
            /* Primary button -> Blue */
            <Link
              to={isVideo ? `/student/interview-video/${interview._id}` : `/student/interview-text/${interview._id}`}
              className="btn btn-sm fw-bold px-3 py-1.5 text-white"
              style={{
                backgroundColor: '#2563eb',
                borderColor: '#2563eb',
                borderRadius: '8px',
                fontSize: '0.785rem'
              }}
            >
              Start Now
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;
