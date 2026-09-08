import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  FaArrowLeft,
  FaBriefcase,
  FaCheckCircle,
  FaChevronRight,
  FaFilePdf,
  FaHistory,
  FaSearch,
  FaShieldAlt,
  FaUpload,
} from 'react-icons/fa';

import toast from 'react-hot-toast';

import StudentLayout from '../../components/StudentLayout';
import { atsApi, errorMessage } from './ats/atsApi';

const AtsScanner = () => {
  const navigate = useNavigate();

  const [resume, setResume] = useState(null);
  const [targetJobs, setTargetJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [resumeResponse, jobsResponse] = await Promise.all([
          atsApi.getResume(),
          atsApi.getTargetJobs(),
        ]);

        const nextResume = resumeResponse.data?.resume || null;
        const jobs = jobsResponse.data?.targetJobs || [];

        setResume(nextResume);
        setTargetJobs(jobs);
        setSelectedJobId(jobs[0]?._id || '');
      } catch (requestError) {
        const message = errorMessage(
          requestError,
          'Unable to load ATS Scanner data.'
        );

        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleCheck = async () => {
    if (!resume) {
      return toast.error('Upload a resume before checking your ATS score.');
    }

    if (!selectedJobId) {
      return toast.error('Select a Target Job first.');
    }

    try {
      setChecking(true);

      const response = await atsApi.createScan({
        resumeId: resume._id,
        targetJobId: selectedJobId,
      });

      const scan = response.data?.scan;

      if (!scan?._id) {
        throw new Error('The ATS service returned no analysis.');
      }

      toast.success(
        response.data.cached
          ? 'Existing analysis loaded.'
          : 'AI ATS analysis completed.'
      );

      navigate(`/student/ats-scanner/analysis/${scan._id}`);
    } catch (requestError) {
      const message = errorMessage(
        requestError,
        'ATS analysis could not be completed.'
      );

      setError(message);
      toast.error(message);
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="container-fluid py-5">
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: '55vh' }}
          >
            <div className="text-center">
              <div
                className="spinner-border text-primary mb-3"
                role="status"
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                }}
              >
                <span className="visually-hidden">Loading...</span>
              </div>

              <p className="text-muted mb-0 fw-medium">
                Loading ATS Scanner...
              </p>
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const selectedJob = targetJobs.find(
    (job) => job._id === selectedJobId
  );

  const resumeName =
    resume?.resume_file?.fileName ||
    resume?.fileName ||
    'Resume.pdf';

  return (
    <StudentLayout>
      <div
        className="container-fluid px-2 px-md-3 px-xl-4 py-3 py-lg-4"
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
        }}
      >
        <div className="mb-4">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-end gap-3">
            <div>
              <Link
                to="/student/dashboard"
                className="text-decoration-none text-muted small fw-semibold d-inline-flex align-items-center mb-3"
              >
                <FaArrowLeft className="me-2" size={12} />
                Back to Dashboard
              </Link>

              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded-4 bg-primary text-white shadow-sm flex-shrink-0"
                  style={{
                    width: '52px',
                    height: '52px',
                  }}
                >
                  <FaSearch size={20} />
                </div>

                <div>
                  <h1
                    className="fw-bold mb-1"
                    style={{
                      fontSize: 'clamp(1.55rem, 3vw, 2.1rem)',
                      letterSpacing: '-0.03em',
                    }}
                  >
                    AI ATS Resume Checker
                  </h1>

                  <p className="text-muted mb-0">
                    Evaluate your resume against the job you want.
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="/student/ats-scanner/history"
              className="btn btn-outline-secondary rounded-3 d-inline-flex align-items-center justify-content-center px-3 py-2 fw-semibold"
            >
              <FaHistory className="me-2" size={14} />
              Analysis History
            </Link>
          </div>
        </div>

        <div
          className="card border shadow-sm rounded-4 mb-4 overflow-hidden"
          style={{
            borderColor: '#e7eaf0',
            background: '#ffffff',
          }}
        >
          {/* <div className="card-body p-4 p-lg-5">
            <div className="row align-items-center g-4">
              <div className="col-lg-7">
                <div className="d-flex align-items-start gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                    style={{
                      width: '46px',
                      height: '46px',
                      background: '#f1f5ff',
                      color: '#0d6efd',
                    }}
                  >
                    <FaShieldAlt size={19} />
                  </div>

                  <div>
                    <div
                      className="small fw-bold text-primary mb-2"
                      style={{ letterSpacing: '0.06em' }}
                    >
                      RESUME INTELLIGENCE
                    </div>

                    <h2
                      className="fw-bold mb-2"
                      style={{
                        fontSize: 'clamp(1.35rem, 2.5vw, 1.8rem)',
                        letterSpacing: '-0.025em',
                      }}
                    >
                      Know how your resume performs before you apply.
                    </h2>

                    <p
                      className="text-muted mb-0"
                      style={{
                        maxWidth: '650px',
                        lineHeight: '1.7',
                      }}
                    >
                      Compare your resume with a specific target position
                      and identify the skills, keywords, strengths, and
                      opportunities that matter most.
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-lg-5">
                <div className="row g-2">
                  <div className="col-4">
                    <div
                      className="h-100 rounded-3 p-3 text-center"
                      style={{
                        background: '#f8f9fb',
                        border: '1px solid #edf0f4',
                      }}
                    >
                      <FaCheckCircle
                        className="text-success mb-2"
                        size={17}
                      />

                      <div className="small fw-semibold">
                        Skills
                      </div>

                      <div className="text-muted small">
                        Match
                      </div>
                    </div>
                  </div>

                  <div className="col-4">
                    <div
                      className="h-100 rounded-3 p-3 text-center"
                      style={{
                        background: '#f8f9fb',
                        border: '1px solid #edf0f4',
                      }}
                    >
                      <FaCheckCircle
                        className="text-success mb-2"
                        size={17}
                      />

                      <div className="small fw-semibold">
                        Keywords
                      </div>

                      <div className="text-muted small">
                        Check
                      </div>
                    </div>
                  </div>

                  <div className="col-4">
                    <div
                      className="h-100 rounded-3 p-3 text-center"
                      style={{
                        background: '#f8f9fb',
                        border: '1px solid #edf0f4',
                      }}
                    >
                      <FaCheckCircle
                        className="text-success mb-2"
                        size={17}
                      />

                      <div className="small fw-semibold">
                        ATS
                      </div>

                      <div className="text-muted small">
                        Score
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div> */}
        </div>

        {error && (
          <div
            className="alert alert-danger border rounded-4 shadow-sm d-flex align-items-start mb-4"
            role="alert"
          >
            <div>
              <strong>Something went wrong.</strong>
              <div className="small mt-1">{error}</div>
            </div>

            <button
              type="button"
              className="btn-close ms-auto"
              aria-label="Close"
              onClick={() => setError('')}
            />
          </div>
        )}

        {!resume ? (
          <div
            className="card border shadow-sm rounded-4 overflow-hidden"
            style={{ borderColor: '#e7eaf0' }}
          >
            <div className="card-body text-center py-5 px-4 px-lg-5">
              <div
                className="d-flex align-items-center justify-content-center rounded-4 mx-auto mb-4"
                style={{
                  width: '84px',
                  height: '84px',
                  background: '#fff3f3',
                  color: '#dc3545',
                }}
              >
                <FaFilePdf size={32} />
              </div>

              <div
                className="small fw-bold text-danger mb-2"
                style={{ letterSpacing: '0.06em' }}
              >
                RESUME REQUIRED
              </div>

              <h3
                className="fw-bold mb-2"
                style={{ letterSpacing: '-0.025em' }}
              >
                Upload your resume first
              </h3>

              <p
                className="text-muted mx-auto mb-4"
                style={{
                  maxWidth: '560px',
                  lineHeight: '1.7',
                }}
              >
                ATS analysis needs the PDF currently stored in your
                student profile. Upload or manage your resume before
                starting an analysis.
              </p>

              <Link
                to="/student/resume"
                className="btn btn-primary rounded-3 px-4 py-2 d-inline-flex align-items-center fw-semibold"
              >
                <FaUpload className="me-2" />
                Manage Resume
                <FaChevronRight className="ms-2" size={12} />
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div
              className="card border shadow-sm rounded-4 overflow-hidden mb-4"
              style={{ borderColor: '#e7eaf0' }}
            >
              <div className="card-body p-3 p-md-4 p-lg-5">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                  <div>
                    <div
                      className="small fw-bold text-primary mb-2"
                      style={{ letterSpacing: '0.06em' }}
                    >
                      NEW ANALYSIS
                    </div>

                    <h2
                      className="fw-bold mb-1"
                      style={{
                        fontSize: 'clamp(1.35rem, 2.5vw, 1.75rem)',
                        letterSpacing: '-0.025em',
                      }}
                    >
                      Start your ATS analysis
                    </h2>

                    <p className="text-muted mb-0">
                      Select your resume and target position.
                    </p>
                  </div>

                  <div
                    className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                    style={{
                      width: '46px',
                      height: '46px',
                      background: '#f1f5ff',
                      color: '#0d6efd',
                    }}
                  >
                    <FaSearch size={18} />
                  </div>
                </div>

                <div className="row g-3 g-lg-4">
                  <div className="col-lg-5">
                    <div
                      className="h-100 rounded-4 p-3 p-lg-4"
                      style={{
                        border: '1px solid #e7eaf0',
                        background: '#fbfcfd',
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          <div
                            className="small fw-bold text-muted mb-1"
                            style={{ letterSpacing: '0.05em' }}
                          >
                            YOUR RESUME
                          </div>

                          <div className="small text-muted">
                            Ready for analysis
                          </div>
                        </div>

                        <div
                          className="d-flex align-items-center justify-content-center rounded-3"
                          style={{
                            width: '42px',
                            height: '42px',
                            background: '#fff0f0',
                            color: '#dc3545',
                          }}
                        >
                          <FaFilePdf size={19} />
                        </div>
                      </div>

                      <div
                        className="rounded-3 p-3"
                        style={{
                          background: '#ffffff',
                          border: '1px solid #edf0f4',
                        }}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <div className="flex-grow-1 overflow-hidden">
                            <div
                              className="fw-bold text-truncate"
                              title={resumeName}
                            >
                              {resumeName}
                            </div>

                            <div className="d-flex align-items-center mt-1">
                              <FaCheckCircle
                                className="text-success me-1"
                                size={11}
                              />

                              <small className="text-success fw-semibold">
                                Ready for AI analysis
                              </small>
                            </div>
                          </div>

                          <Link
                            to="/student/resume"
                            className="btn btn-sm btn-outline-secondary rounded-3 px-3 flex-shrink-0"
                          >
                            Change
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-5">
                    <div
                      className="h-100 rounded-4 p-3 p-lg-4"
                      style={{
                        border: '1px solid #e7eaf0',
                        background: '#fbfcfd',
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          <div
                            className="small fw-bold text-muted mb-1"
                            style={{ letterSpacing: '0.05em' }}
                          >
                            TARGET JOB
                          </div>

                          <div className="small text-muted">
                            Choose the position
                          </div>
                        </div>

                        <div
                          className="d-flex align-items-center justify-content-center rounded-3"
                          style={{
                            width: '42px',
                            height: '42px',
                            background: '#f1f5ff',
                            color: '#0d6efd',
                          }}
                        >
                          <FaBriefcase size={18} />
                        </div>
                      </div>

                      {targetJobs.length ? (
                        <div
                          className="rounded-3 p-3"
                          style={{
                            background: '#ffffff',
                            border: '1px solid #edf0f4',
                          }}
                        >
                          <select
                            className="form-select border-0 shadow-none fw-semibold px-0"
                            value={selectedJobId}
                            onChange={(event) =>
                              setSelectedJobId(event.target.value)
                            }
                            style={{
                              backgroundColor: 'transparent',
                            }}
                          >
                            {targetJobs.map((job) => (
                              <option
                                key={job._id}
                                value={job._id}
                              >
                                {job.target_job_role}
                                {job.target_company
                                  ? ` - ${job.target_company}`
                                  : ''}
                              </option>
                            ))}
                          </select>

                          <div className="d-flex align-items-center mt-2">
                            <FaCheckCircle
                              className="text-success me-2"
                              size={11}
                            />

                            <small className="text-muted">
                              Position selected for comparison
                            </small>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="rounded-3 p-3 h-100 d-flex align-items-center"
                          style={{
                            background: '#fff9e8',
                            border: '1px solid #f4e3aa',
                          }}
                        >
                          <div>
                            <div className="fw-bold text-dark">
                              No target jobs found.
                            </div>

                            <div className="small text-muted mt-1">
                              Add a target job before scanning.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-lg-2">
                    <div className="h-100 d-flex">
                      <button
                        type="button"
                        className="btn btn-primary rounded-4 w-100 fw-semibold shadow-sm d-flex flex-column align-items-center justify-content-center"
                        style={{
                          minHeight: '100%',
                          padding: '24px 14px',
                        }}
                        disabled={checking || !targetJobs.length}
                        onClick={handleCheck}
                      >
                        {checking ? (
                          <>
                            <span
                              className="spinner-border mb-3"
                              role="status"
                              aria-hidden="true"
                              style={{
                                width: '1.4rem',
                                height: '1.4rem',
                              }}
                            />

                            <span>Analyzing...</span>
                          </>
                        ) : (
                          <>
                            <FaSearch size={21} className="mb-3" />

                            <span>Check ATS</span>

                            <small
                              className="mt-2 opacity-75 text-center"
                              style={{ fontSize: '0.72rem' }}
                            >
                              Analyze resume
                            </small>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {selectedJob && (
                  <div
                    className="mt-4 rounded-4 p-3 p-md-4"
                    style={{
                      background: '#f7f9fc',
                      border: '1px solid #e7eaf0',
                    }}
                  >
                    <div className="row align-items-center g-3">
                      <div className="col-md-8">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                            style={{
                              width: '46px',
                              height: '46px',
                              background: '#ffffff',
                              color: '#0d6efd',
                              border: '1px solid #e5eaf2',
                            }}
                          >
                            <FaBriefcase size={18} />
                          </div>

                          <div className="overflow-hidden">
                            <div
                              className="small fw-bold text-muted mb-1"
                              style={{ letterSpacing: '0.05em' }}
                            >
                              SELECTED TARGET
                            </div>

                            <div className="fw-bold fs-5 text-truncate">
                              {selectedJob.target_job_role}
                            </div>

                            <div className="text-muted small mt-1">
                              {selectedJob.target_company ||
                                'Company not specified'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div
                          className="d-flex align-items-center justify-content-md-end"
                        >
                          <div
                            className="d-flex align-items-center rounded-pill px-3 py-2"
                            style={{
                              background: '#ecf8f0',
                              color: '#198754',
                            }}
                          >
                            <FaCheckCircle
                              className="me-2"
                              size={13}
                            />

                            <span className="small fw-semibold">
                              Ready to compare
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="row g-3 g-lg-4">
              <div className="col-md-4">
                <div
                  className="card border shadow-sm rounded-4 h-100"
                  style={{ borderColor: '#e7eaf0' }}
                >
                  <div className="card-body p-4 p-lg-4 d-flex flex-column">
                    <div className="d-flex align-items-center justify-content-between mb-4">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-3"
                        style={{
                          width: '44px',
                          height: '44px',
                          background: '#f1f5ff',
                          color: '#0d6efd',
                        }}
                      >
                        <FaSearch size={17} />
                      </div>

                      <span
                        className="small fw-bold text-muted"
                        style={{ letterSpacing: '0.05em' }}
                      >
                        01
                      </span>
                    </div>

                    <h5
                      className="fw-bold mb-2"
                      style={{ letterSpacing: '-0.015em' }}
                    >
                      ATS Compatibility
                    </h5>

                    <p
                      className="text-muted small mb-0"
                      style={{ lineHeight: '1.7' }}
                    >
                      Understand how well your resume is structured for
                      automated screening systems.
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div
                  className="card border shadow-sm rounded-4 h-100"
                  style={{ borderColor: '#e7eaf0' }}
                >
                  <div className="card-body p-4 p-lg-4 d-flex flex-column">
                    <div className="d-flex align-items-center justify-content-between mb-4">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-3"
                        style={{
                          width: '44px',
                          height: '44px',
                          background: '#eefaf3',
                          color: '#198754',
                        }}
                      >
                        <FaCheckCircle size={17} />
                      </div>

                      <span
                        className="small fw-bold text-muted"
                        style={{ letterSpacing: '0.05em' }}
                      >
                        02
                      </span>
                    </div>

                    <h5
                      className="fw-bold mb-2"
                      style={{ letterSpacing: '-0.015em' }}
                    >
                      Skills & Keywords
                    </h5>

                    <p
                      className="text-muted small mb-0"
                      style={{ lineHeight: '1.7' }}
                    >
                      Find matching skills, important keywords, and
                      potential gaps for your target position.
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div
                  className="card border shadow-sm rounded-4 h-100"
                  style={{ borderColor: '#e7eaf0' }}
                >
                  <div className="card-body p-4 p-lg-4 d-flex flex-column">
                    <div className="d-flex align-items-center justify-content-between mb-4">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-3"
                        style={{
                          width: '44px',
                          height: '44px',
                          background: '#fff8e8',
                          color: '#b77900',
                        }}
                      >
                        <FaBriefcase size={17} />
                      </div>

                      <span
                        className="small fw-bold text-muted"
                        style={{ letterSpacing: '0.05em' }}
                      >
                        03
                      </span>
                    </div>

                    <h5
                      className="fw-bold mb-2"
                      style={{ letterSpacing: '-0.015em' }}
                    >
                      Job-Specific Insights
                    </h5>

                    <p
                      className="text-muted small mb-0"
                      style={{ lineHeight: '1.7' }}
                    >
                      Get analysis based specifically on the job you're
                      targeting rather than a generic resume score.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </StudentLayout>
  );
};

export default AtsScanner;