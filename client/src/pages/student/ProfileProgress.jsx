import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';
import API from '../../services/api';

import {
  FaCheckCircle,
  FaRegCircle,
  FaUser,
  FaGraduationCap,
  FaFilePdf,
  FaLink,
  FaArrowRight,
  FaIdCard,
  FaExclamationCircle
} from 'react-icons/fa';

const ProfileProgress = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfileProgress();
  }, []);

  const fetchProfileProgress = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await API.get('/profile/progress');

      if (res.data && res.data.success) {
        setData(res.data);
      } else {
        setError('Failed to fetch profile progress');
      }
    } catch (err) {
      console.error('Error fetching profile progress:', err);
      setError(
        err.response?.data?.message || 'Failed to load profile progress'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <style>{`
          .profile-progress-page {
            background: #f8f9fc;
            min-height: 100%;
          }

          .loading-card {
            border: 1px solid #e9ecef;
            border-radius: 12px;
            background: #ffffff;
            box-shadow: 0 4px 18px rgba(0, 0, 0, 0.04);
          }
        `}</style>

        <div className="profile-progress-page p-3 p-md-4">
          <div className="loading-card p-5 text-center">
            <div
              className="spinner-border text-primary mb-3"
              role="status"
              style={{ width: '2.5rem', height: '2.5rem' }}
            >
              <span className="visually-hidden">
                Loading progress...
              </span>
            </div>

            <h6 className="fw-bold text-dark mb-1">
              Calculating Profile Progress
            </h6>

            <p className="text-muted small mb-0">
              Please wait while we calculate your profile completion.
            </p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (error || !data) {
    return (
      <StudentLayout>
        <style>{`
          .profile-progress-page {
            background: #f8f9fc;
            min-height: 100%;
          }

          .error-card {
            max-width: 600px;
            margin: 30px auto;
            border: 1px solid #f5c2c7;
            border-radius: 12px;
            background: #fff;
            box-shadow: 0 4px 18px rgba(0, 0, 0, 0.04);
          }

          .error-icon {
            width: 52px;
            height: 52px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: rgba(220, 53, 69, 0.08);
          }
        `}</style>

        <div className="profile-progress-page p-3 p-md-4">
          <div className="error-card p-4 text-center">
            <div className="error-icon mb-3">
              <FaExclamationCircle className="text-danger fs-4" />
            </div>

            <h5 className="fw-bold text-dark mb-2">
              Error Loading Profile Progress
            </h5>

            <p className="text-muted small mb-4">
              {error ||
                'Something went wrong while calculating progress.'}
            </p>

            <button
              className="btn btn-outline-danger btn-sm px-4"
              onClick={fetchProfileProgress}
            >
              Retry
            </button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const {
    progress,
    completedWeight,
    remainingWeight,
    sections
  } = data;

  const reg = sections.registration || {
    weight: 15,
    completed: 0,
    percentage: 0,
    fields: {}
  };

  const personal = sections.personal || {
    weight: 15,
    completed: 0,
    percentage: 0,
    fields: {}
  };

  const edu = sections.education || {
    weight: 25,
    completed: 0,
    percentage: 0,
    fields: {}
  };

  const resume = sections.resume || {
    weight: 30,
    completed: 0,
    percentage: 0,
    fields: {}
  };

  const links = sections.professionalLinks || {
    weight: 15,
    completed: 0,
    percentage: 0,
    fields: {}
  };

  const getProgressClass = (percentage) => {
    if (percentage >= 100) return 'bg-success';
    if (percentage >= 50) return 'bg-primary';
    if (percentage > 0) return 'bg-warning';
    return 'bg-secondary';
  };

  const getStatusBadge = (percentage) => {
    if (percentage >= 100) {
      return (
        <span className="progress-status completed">
          <FaCheckCircle />
          Complete
        </span>
      );
    }

    if (percentage > 0) {
      return (
        <span className="progress-status partial">
          In Progress
        </span>
      );
    }

    return (
      <span className="progress-status pending">
        Not Started
      </span>
    );
  };

  const renderField = (label, completed, weight) => (
    <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3 border-0 progress-field">
      <span className="d-flex align-items-center gap-2">
        {completed ? (
          <FaCheckCircle className="text-success field-icon" />
        ) : (
          <FaRegCircle className="text-muted field-icon" />
        )}

        <span className={completed ? 'text-dark' : 'text-muted'}>
          {label}
        </span>
      </span>

      <span
        className={`fw-bold extra-small ${
          completed ? 'text-success' : 'text-muted'
        }`}
      >
        {completed ? `+${weight}%` : '0%'}
      </span>
    </li>
  );

  return (
    <StudentLayout>
      <style>{`
        .profile-progress-page {
          background: #f8f9fc;
          min-height: 100%;
        }

        .profile-progress-header {
          margin-bottom: 28px;
        }

        .profile-progress-title {
          font-size: 1.65rem;
          font-weight: 800;
          color: #212529;
          letter-spacing: -0.3px;
        }

        .profile-progress-subtitle {
          max-width: 720px;
          line-height: 1.6;
        }

        .btn-primary-custom {
          background: #0d6efd;
          border: 1px solid #0d6efd;
          color: #fff;
          padding: 10px 18px;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .btn-primary-custom:hover {
          background: #0b5ed7;
          border-color: #0b5ed7;
          color: #fff;
          transform: translateY(-1px);
        }

        .card-custom {
          border: 1px solid #e9ecef !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.04) !important;
          transition: all 0.2s ease;
        }

        .card-custom:hover {
          box-shadow: 0 7px 24px rgba(0, 0, 0, 0.06) !important;
        }

        .overall-card {
          position: relative;
          overflow: hidden;
        }

        .overall-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: #0d6efd;
        }

        .overall-percentage {
          font-size: 2.7rem;
          line-height: 1;
          font-weight: 800;
          color: #0d6efd;
          letter-spacing: -1px;
        }

        .overall-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #6c757d;
          margin-top: 5px;
        }

        .main-progress {
          height: 12px !important;
          border-radius: 10px !important;
          background: #e9ecef !important;
          overflow: hidden;
        }

        .main-progress .progress-bar {
          border-radius: 10px;
        }

        .completion-summary {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          flex-wrap: wrap;
        }

        .section-card {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .section-card-header {
          min-height: 48px;
        }

        .section-icon {
          width: 38px;
          height: 38px;
          border-radius: 9px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(13, 110, 253, 0.08);
          color: #0d6efd;
          flex-shrink: 0;
        }

        .section-icon.resume-icon {
          background: rgba(220, 53, 69, 0.08);
          color: #dc3545;
        }

        .section-title {
          font-size: 1rem;
          font-weight: 700;
          color: #212529;
          margin-bottom: 0;
        }

        .section-description {
          color: #6c757d;
          font-size: 0.75rem;
          line-height: 1.55;
        }

        .section-score {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 5px 9px;
          border-radius: 6px;
          background: rgba(13, 110, 253, 0.07);
          color: #0d6efd;
          border: 1px solid rgba(13, 110, 253, 0.12);
          white-space: nowrap;
        }

        .section-progress {
          height: 6px !important;
          border-radius: 10px !important;
          background: #edf0f2 !important;
        }

        .section-progress .progress-bar {
          border-radius: 10px;
        }

        .progress-field {
          border-bottom: 1px solid #f1f3f5 !important;
        }

        .progress-field:last-child {
          border-bottom: 0 !important;
        }

        .field-icon {
          font-size: 0.9rem;
        }

        .extra-small {
          font-size: 0.72rem;
        }

        .progress-status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 5px 9px;
          border-radius: 20px;
          white-space: nowrap;
        }

        .progress-status.completed {
          color: #198754;
          background: rgba(25, 135, 84, 0.08);
        }

        .progress-status.partial {
          color: #856404;
          background: rgba(255, 193, 7, 0.12);
        }

        .progress-status.pending {
          color: #6c757d;
          background: #f1f3f5;
        }

        .link-item {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 9px;
          transition: all 0.2s ease;
        }

        .link-item:hover {
          background: #fff;
          border-color: #dee2e6;
        }

        .resume-action {
          border-radius: 8px;
          font-weight: 600;
          padding: 9px 14px;
        }

        @media (max-width: 767.98px) {
          .profile-progress-title {
            font-size: 1.4rem;
          }

          .overall-percentage {
            font-size: 2.2rem;
          }

          .completion-summary {
            flex-direction: column;
            gap: 8px;
          }

          .section-score {
            align-self: flex-start;
          }
        }
      `}</style>

      <div className="profile-progress-page p-3 p-md-4">
        {/* HEADER */}
        <div className="profile-progress-header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <h3 className="profile-progress-title mb-1">
              PROFILE PROGRESS
            </h3>

            <p className="profile-progress-subtitle text-muted small mb-0">
              Track and complete your profile criteria calculated
              dynamically from your MongoDB student data.
            </p>
          </div>

          <Link
            to="/student/profile"
            className="btn-primary-custom d-flex align-items-center gap-2"
          >
            Complete Profile
            <FaArrowRight size={13} />
          </Link>
        </div>

        {/* OVERALL COMPLETION */}
        <div className="card card-custom overall-card p-4 mb-4 bg-white border-0">
          <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-4 gap-3">
            <div>
              <h5 className="fw-bold text-dark mb-1">
                Overall Profile Completion
              </h5>

              <p className="text-muted small mb-0">
                Completing all sections improves your interview
                readiness and recruiter ATS visibility.
              </p>
            </div>

            <div className="text-md-end">
              <div className="overall-percentage">
                {progress}%
              </div>

              <div className="overall-label">
                Profile Complete
              </div>
            </div>
          </div>

          <div
            className="progress main-progress mb-3"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div
              className="progress-bar bg-primary"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="completion-summary fw-bold small">
            <span className="text-success d-flex align-items-center gap-2">
              <FaCheckCircle />
              {completedWeight}% Completed
            </span>

            <span className="text-secondary">
              {remainingWeight}% Remaining
            </span>
          </div>
        </div>

        {/* SECTION BREAKDOWN */}
        <div className="row g-4 mb-4">
          {/* REGISTRATION */}
          <div className="col-lg-6">
            <div className="card card-custom section-card p-4 bg-white border-0">
              <div className="section-card-header d-flex justify-content-between align-items-center mb-3 gap-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="section-icon">
                    <FaIdCard />
                  </div>

                  <div>
                    <h5 className="section-title">
                      Registration Information
                    </h5>

                    <div className="section-description">
                      Basic account information
                    </div>
                  </div>
                </div>

                {getStatusBadge(reg.percentage)}
              </div>

              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="section-description">
                  Completion
                </span>

                <span className="section-score">
                  {reg.completed} / {reg.weight}%
                </span>
              </div>

              <div className="progress section-progress mb-3">
                <div
                  className={`progress-bar ${getProgressClass(
                    reg.percentage
                  )}`}
                  style={{
                    width: `${Math.min(
                      reg.percentage || 0,
                      100
                    )}%`
                  }}
                ></div>
              </div>

              <p className="text-muted extra-small mb-2">
                Weight: 15% (Full Name 5%, Email 5%, Mobile 5%)
              </p>

              <ul className="list-group list-group-flush small">
                {renderField(
                  'Full Name',
                  reg.fields.fullName,
                  5
                )}

                {renderField(
                  'Email Address',
                  reg.fields.email,
                  5
                )}

                {renderField(
                  'Mobile Number',
                  reg.fields.mobileNumber,
                  5
                )}
              </ul>
            </div>
          </div>

          {/* PERSONAL */}
          <div className="col-lg-6">
            <div className="card card-custom section-card p-4 bg-white border-0">
              <div className="section-card-header d-flex justify-content-between align-items-center mb-3 gap-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="section-icon">
                    <FaUser />
                  </div>

                  <div>
                    <h5 className="section-title">
                      Personal Information
                    </h5>

                    <div className="section-description">
                      Personal profile details
                    </div>
                  </div>
                </div>

                {getStatusBadge(personal.percentage)}
              </div>

              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="section-description">
                  Completion
                </span>

                <span className="section-score">
                  {personal.completed} / {personal.weight}%
                </span>
              </div>

              <div className="progress section-progress mb-3">
                <div
                  className={`progress-bar ${getProgressClass(
                    personal.percentage
                  )}`}
                  style={{
                    width: `${Math.min(
                      personal.percentage || 0,
                      100
                    )}%`
                  }}
                ></div>
              </div>

              <p className="text-muted extra-small mb-2">
                Weight: 15% (3% per field)
              </p>

              <ul className="list-group list-group-flush small">
                {renderField(
                  'Profile Photo',
                  personal.fields.profilePhoto,
                  3
                )}

                {renderField(
                  'Date of Birth',
                  personal.fields.dateOfBirth,
                  3
                )}

                {renderField(
                  'Gender',
                  personal.fields.gender,
                  3
                )}

                {renderField(
                  'Location',
                  personal.fields.location,
                  3
                )}

                {renderField(
                  'About / Bio',
                  personal.fields.bio,
                  3
                )}
              </ul>
            </div>
          </div>

          {/* EDUCATION */}
          <div className="col-lg-6">
            <div className="card card-custom section-card p-4 bg-white border-0">
              <div className="section-card-header d-flex justify-content-between align-items-center mb-3 gap-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="section-icon">
                    <FaGraduationCap />
                  </div>

                  <div>
                    <h5 className="section-title">
                      Education
                    </h5>

                    <div className="section-description">
                      Academic qualifications
                    </div>
                  </div>
                </div>

                {getStatusBadge(edu.percentage)}
              </div>

              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="section-description">
                  Completion
                </span>

                <span className="section-score">
                  {edu.completed} / {edu.weight}%
                </span>
              </div>

              <div className="progress section-progress mb-3">
                <div
                  className={`progress-bar ${getProgressClass(
                    edu.percentage
                  )}`}
                  style={{
                    width: `${Math.min(
                      edu.percentage || 0,
                      100
                    )}%`
                  }}
                ></div>
              </div>

              <p className="text-muted extra-small mb-2">
                Weight: 25% (Qualification 5%, College 5%,
                Degree 4%, Specialization 4%, Year 4%, CGPA 3%)
              </p>

              <ul className="list-group list-group-flush small">
                {renderField(
                  'Highest Qualification',
                  edu.fields.highestQualification,
                  5
                )}

                {renderField(
                  'College / University',
                  edu.fields.collegeUniversity,
                  5
                )}

                {renderField(
                  'Degree',
                  edu.fields.degree,
                  4
                )}

                {renderField(
                  'Specialization',
                  edu.fields.specialization,
                  4
                )}

                {renderField(
                  'Graduation Year',
                  edu.fields.graduationYear,
                  4
                )}

                {renderField(
                  'CGPA / Percentage',
                  edu.fields.cgpaPercentage,
                  3
                )}
              </ul>
            </div>
          </div>

          {/* RESUME */}
          <div className="col-lg-6">
            <div className="card card-custom section-card p-4 bg-white border-0">
              <div className="section-card-header d-flex justify-content-between align-items-center mb-3 gap-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="section-icon resume-icon">
                    <FaFilePdf />
                  </div>

                  <div>
                    <h5 className="section-title">
                      Resume PDF
                    </h5>

                    <div className="section-description">
                      Professional resume document
                    </div>
                  </div>
                </div>

                {getStatusBadge(resume.percentage)}
              </div>

              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="section-description">
                  Completion
                </span>

                <span className="section-score">
                  {resume.completed} / {resume.weight}%
                </span>
              </div>

              <div className="progress section-progress mb-3">
                <div
                  className={`progress-bar ${getProgressClass(
                    resume.percentage
                  )}`}
                  style={{
                    width: `${Math.min(
                      resume.percentage || 0,
                      100
                    )}%`
                  }}
                ></div>
              </div>

              <p className="text-muted extra-small mb-3">
                Weight: 30% (Uploaded Resume PDF Document in
                MongoDB)
              </p>

              <div className="flex-grow-1">
                <div className="progress-field d-flex justify-content-between align-items-center py-3">
                  <span className="d-flex align-items-center gap-2">
                    {resume.fields.resumePdf ? (
                      <FaCheckCircle className="text-success fs-5" />
                    ) : (
                      <FaRegCircle className="text-muted fs-5" />
                    )}

                    <span
                      className={
                        resume.fields.resumePdf
                          ? 'text-dark'
                          : 'text-muted'
                      }
                    >
                      Uploaded Resume Document (PDF)
                    </span>
                  </span>

                  <span
                    className={`fw-bold ${
                      resume.fields.resumePdf
                        ? 'text-success'
                        : 'text-muted'
                    }`}
                  >
                    {resume.fields.resumePdf ? '+30%' : '0%'}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <Link
                  to="/student/resume"
                  className="btn btn-outline-primary resume-action w-100"
                >
                  {resume.fields.resumePdf
                    ? 'Manage Resume'
                    : 'Upload Resume (+30%)'}
                  <FaArrowRight className="ms-2" size={12} />
                </Link>
              </div>
            </div>
          </div>

          {/* PROFESSIONAL LINKS */}
          <div className="col-lg-12">
            <div className="card card-custom section-card p-4 bg-white border-0">
              <div className="section-card-header d-flex justify-content-between align-items-center mb-3 gap-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="section-icon">
                    <FaLink />
                  </div>

                  <div>
                    <h5 className="section-title">
                      Professional Links
                    </h5>

                    <div className="section-description">
                      Links that showcase your professional presence
                    </div>
                  </div>
                </div>

                {getStatusBadge(links.percentage)}
              </div>

              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="section-description">
                  Completion
                </span>

                <span className="section-score">
                  {links.completed} / {links.weight}%
                </span>
              </div>

              <div className="progress section-progress mb-3">
                <div
                  className={`progress-bar ${getProgressClass(
                    links.percentage
                  )}`}
                  style={{
                    width: `${Math.min(
                      links.percentage || 0,
                      100
                    )}%`
                  }}
                ></div>
              </div>

              <p className="text-muted extra-small mb-3">
                Weight: 15% (LinkedIn 5%, Portfolio 5%, Other
                Link 5%)
              </p>

              <div className="row g-3">
                <div className="col-md-4">
                  <div className="link-item p-3 d-flex justify-content-between align-items-center">
                    <span className="d-flex align-items-center gap-2 small">
                      {links.fields.linkedin ? (
                        <FaCheckCircle className="text-success" />
                      ) : (
                        <FaRegCircle className="text-muted" />
                      )}

                      LinkedIn Profile
                    </span>

                    <span
                      className={`fw-bold extra-small ${
                        links.fields.linkedin
                          ? 'text-success'
                          : 'text-muted'
                      }`}
                    >
                      {links.fields.linkedin ? '+5%' : '0%'}
                    </span>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="link-item p-3 d-flex justify-content-between align-items-center">
                    <span className="d-flex align-items-center gap-2 small">
                      {links.fields.portfolio ? (
                        <FaCheckCircle className="text-success" />
                      ) : (
                        <FaRegCircle className="text-muted" />
                      )}

                      Personal Portfolio
                    </span>

                    <span
                      className={`fw-bold extra-small ${
                        links.fields.portfolio
                          ? 'text-success'
                          : 'text-muted'
                      }`}
                    >
                      {links.fields.portfolio ? '+5%' : '0%'}
                    </span>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="link-item p-3 d-flex justify-content-between align-items-center">
                    <span className="d-flex align-items-center gap-2 small">
                      {links.fields.other ? (
                        <FaCheckCircle className="text-success" />
                      ) : (
                        <FaRegCircle className="text-muted" />
                      )}

                      Other Professional Link
                    </span>

                    <span
                      className={`fw-bold extra-small ${
                        links.fields.other
                          ? 'text-success'
                          : 'text-muted'
                      }`}
                    >
                      {links.fields.other ? '+5%' : '0%'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default ProfileProgress;