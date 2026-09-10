import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaEye,
  FaTrash,
  FaChartLine,
  FaFileAlt,
  FaFilePdf,
  FaArrowUp,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

import StudentLayout from '../../../components/StudentLayout';
import { atsApi, errorMessage, normalizeScan } from './atsApi';

const scoreClass = (score) => {
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  return 'danger';
};

const AtsHistory = () => {
  const navigate = useNavigate();

  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState('');
  const [openingResume, setOpeningResume] = useState('');

  const load = async () => {
    try {
      const response = await atsApi.getScans();

      setScans(
        (response.data?.scans || []).map(normalizeScan)
      );
    } catch (error) {
      toast.error(
        errorMessage(error, 'Unable to load ATS history.')
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (
      !window.confirm(
        'Delete this analysis and its tailored resume?'
      )
    ) {
      return;
    }

    try {
      setDeleting(id);

      await atsApi.deleteScan(id);

      setScans((current) =>
        current.filter((scan) => scan._id !== id)
      );

      toast.success('Analysis deleted.');
    } catch (error) {
      toast.error(
        errorMessage(error, 'Unable to delete analysis.')
      );
    } finally {
      setDeleting('');
    }
  };

  const viewResume = async (scanId) => {
    try {
      setOpeningResume(scanId);

      const response = await atsApi.downloadOptimized(scanId);

      const pdfBlob = new Blob([response.data], {
        type: 'application/pdf',
      });

      const pdfUrl = window.URL.createObjectURL(pdfBlob);

      window.open(
        pdfUrl,
        '_blank',
        'noopener,noreferrer'
      );

      setTimeout(() => {
        window.URL.revokeObjectURL(pdfUrl);
      }, 30000);
    } catch (error) {
      toast.error(
        errorMessage(
          error,
          'Unable to open the generated resume.'
        )
      );
    } finally {
      setOpeningResume('');
    }
  };

  return (
    <StudentLayout>
      <style>
        {`
          .ats-history-grid {
            display: grid;
            grid-template-columns:
              minmax(250px, 2.1fr)
              minmax(150px, 1.15fr)
              minmax(175px, 1.25fr)
              minmax(205px, 1.4fr)
              minmax(120px, 0.9fr)
              minmax(250px, 1.7fr);
            align-items: center;
          }

          .ats-history-header {
            min-height: 56px;
            background: #f8f9fc;
            border-bottom: 1px solid #e9ecef;
          }

          .ats-history-row {
            min-height: 88px;
            border-bottom: 1px solid #f0f1f3;
            transition: background-color 0.15s ease;
          }

          .ats-history-row:hover {
            background-color: #fafbff;
          }

          .ats-history-cell {
            min-width: 0;
            padding: 16px 20px;
          }

          .ats-history-cell:first-child {
            padding-left: 24px;
          }

          .ats-history-cell:last-child {
            padding-right: 24px;
          }

          .ats-history-header .ats-history-cell {
            padding-top: 12px;
            padding-bottom: 12px;
          }

          .ats-history-title {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .ats-history-actions {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 8px;
            white-space: nowrap;
          }

          .ats-history-action {
            height: 36px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 9px;
            white-space: nowrap;
          }

          .ats-history-score {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .ats-history-score-bar {
            width: 70px;
            height: 7px;
            flex: 0 0 70px;
            border-radius: 99px;
            overflow: hidden;
            background: #e9ecef;
          }

          .ats-history-score-bar-fill {
            height: 100%;
            border-radius: 99px;
          }

          .ats-history-projected {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .ats-history-projected-icon {
            width: 38px;
            height: 38px;
            flex: 0 0 38px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            background: #eef2ff;
          }

          @media (max-width: 1200px) {
            .ats-history-grid {
              grid-template-columns:
                2fr
                1fr
                1.25fr
                1.35fr
                0.9fr
                1.8fr;
            }

            .ats-history-cell {
              padding-left: 14px;
              padding-right: 14px;
            }

            .ats-history-cell:first-child {
              padding-left: 18px;
            }

            .ats-history-cell:last-child {
              padding-right: 18px;
            }
          }
        `}
      </style>

      <div className="container-fluid px-0">
        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
          <div>
            <Link
              to="/student/ats-scanner"
              className="text-decoration-none text-secondary small fw-semibold"
            >
              <FaArrowLeft className="me-2" />
              Back to Scanner
            </Link>

            <div className="d-flex align-items-center mt-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-4 me-3"
                style={{
                  width: '52px',
                  height: '52px',
                  background:
                    'linear-gradient(135deg, #eef2ff, #e0e7ff)',
                }}
              >
                <FaChartLine
                  className="text-primary"
                  size={21}
                />
              </div>

              <div>
                <h2
                  className="fw-bold mb-1"
                  style={{
                    color: '#111827',
                    letterSpacing: '-0.8px',
                  }}
                >
                  ATS Analysis History
                </h2>

                <p className="text-secondary mb-0">
                  Track your resume performance across different
                  job applications.
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/student/ats-scanner"
            className="btn btn-primary px-4 py-2 rounded-3 fw-semibold"
          >
            New Analysis
          </Link>
        </div>

        {/* Loading */}
        {loading ? (
          <div
            className="card border-0 rounded-4"
            style={{
              boxShadow:
                '0 8px 30px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div className="card-body py-5 text-center">
              <div
                className="spinner-border text-primary mb-3"
                style={{
                  width: '2rem',
                  height: '2rem',
                }}
              />

              <p className="text-secondary mb-0">
                Loading your analysis history...
              </p>
            </div>
          </div>
        ) : scans.length ? (
          <div
            className="card border-0 rounded-4 overflow-hidden"
            style={{
              boxShadow:
                '0 8px 30px rgba(0, 0, 0, 0.05)',
            }}
          >
            {/* Desktop / Tablet Grid */}
            <div
              style={{
                minWidth: '1100px',
              }}
            >
              {/* Header */}
              <div className="ats-history-grid ats-history-header">
                <div className="ats-history-cell">
                  <span className="small fw-bold text-secondary">
                    TARGET JOB
                  </span>
                </div>

                <div className="ats-history-cell">
                  <span className="small fw-bold text-secondary">
                    COMPANY
                  </span>
                </div>

                <div className="ats-history-cell">
                  <span className="small fw-bold text-secondary">
                    ATS SCORE
                  </span>
                </div>

                <div className="ats-history-cell">
                  <span className="small fw-bold text-secondary">
                    PROJECTED SCORE
                  </span>
                </div>

                <div className="ats-history-cell">
                  <span className="small fw-bold text-secondary">
                    ANALYZED
                  </span>
                </div>

                <div className="ats-history-cell text-end">
                  <span className="small fw-bold text-secondary">
                    ACTIONS
                  </span>
                </div>
              </div>

              {/* Rows */}
              {scans.map((scan) => {
                const score = scan.overallScore ?? 0;
                const color = scoreClass(score);

                const projectedScore = Number.isFinite(
                  scan.optimization?.projectedScore
                )
                  ? scan.optimization.projectedScore
                  : null;

                const scoreIncrease =
                  projectedScore !== null
                    ? projectedScore - score
                    : null;

                const hasGeneratedResume =
                  Boolean(scan.tailoredResume) ||
                  Boolean(scan.optimization);

                const isOpeningResume =
                  openingResume === scan._id;

                return (
                  <div
                    key={scan._id}
                    className="ats-history-grid ats-history-row"
                  >
                    {/* Target Job */}
                    <div className="ats-history-cell">
                      <div className="d-flex align-items-center">
                        <div
                          className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0 me-3"
                          style={{
                            width: '44px',
                            height: '44px',
                            backgroundColor: '#f1f3f8',
                          }}
                        >
                          <FaFileAlt
                            size={17}
                            className="text-primary"
                          />
                        </div>

                        <div
                          className="min-width-0"
                          style={{ minWidth: 0 }}
                        >
                          <div
                            className="fw-semibold text-dark ats-history-title"
                            title={
                              scan.targetJob
                                ?.target_job_role ||
                              'Target Job'
                            }
                          >
                            {scan.targetJob
                              ?.target_job_role ||
                              'Target Job'}
                          </div>

                          <div className="small text-secondary mt-1">
                            Resume analysis
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Company */}
                    <div className="ats-history-cell">
                      <div
                        className="text-secondary ats-history-title"
                        title={
                          scan.targetJob
                            ?.target_company || ''
                        }
                      >
                        {scan.targetJob?.target_company ||
                          '—'}
                      </div>
                    </div>

                    {/* ATS Score */}
                    <div className="ats-history-cell">
                      <div className="ats-history-score">
                        <div className="ats-history-score-bar">
                          <div
                            className={`ats-history-score-bar-fill bg-${color}`}
                            style={{
                              width: `${Math.min(
                                Math.max(score, 0),
                                100
                              )}%`,
                            }}
                          />
                        </div>

                        <div>
                          <div
                            className={`fw-bold text-${color}`}
                          >
                            {score}
                            <span className="text-secondary fw-normal">
                              /100
                            </span>
                          </div>

                          <div className="small text-secondary">
                            Current
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Projected Score */}
                    <div className="ats-history-cell">
                      {projectedScore !== null ? (
                        <div className="ats-history-projected">
                          <div className="ats-history-projected-icon">
                            <FaChartLine
                              size={15}
                              className="text-primary"
                            />
                          </div>

                          <div>
                            <div className="d-flex align-items-center gap-2">
                              <span className="fw-bold text-primary">
                                {projectedScore}
                                <span className="text-secondary fw-normal">
                                  /100
                                </span>
                              </span>

                              {scoreIncrease > 0 && (
                                <span
                                  className="badge rounded-pill bg-success-subtle text-success"
                                  style={{
                                    fontSize: '11px',
                                  }}
                                >
                                  <FaArrowUp
                                    size={8}
                                    className="me-1"
                                  />
                                  {scoreIncrease}
                                </span>
                              )}
                            </div>

                            <div className="small text-secondary">
                              After optimization
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-secondary">
                          —
                        </span>
                      )}
                    </div>

                    {/* Date */}
                    <div className="ats-history-cell">
                      <span className="text-secondary text-nowrap">
                        {scan.createdAt
                          ? new Date(
                              scan.createdAt
                            ).toLocaleDateString(
                              undefined,
                              {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              }
                            )
                          : '—'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="ats-history-cell">
                      <div className="ats-history-actions">
                        <button
                          type="button"
                          className="btn btn-light border ats-history-action px-3"
                          onClick={() =>
                            navigate(
                              `/student/ats-scanner/analysis/${scan._id}`
                            )
                          }
                        >
                          <FaEye
                            className="text-primary me-2"
                            size={13}
                          />
                          <span className="small fw-semibold">
                            {/* View */}
                          </span>
                        </button>

                        {hasGeneratedResume && (
                          <button
                            type="button"
                            className="btn btn-light border ats-history-action px-3"
                            onClick={() =>
                              viewResume(scan._id)
                            }
                            disabled={isOpeningResume}
                          >
                            {isOpeningResume ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm text-danger me-2"
                                  style={{
                                    width: '12px',
                                    height: '12px',
                                  }}
                                />

                                <span className="small fw-semibold">
                                  {/* Opening */}
                                </span>
                              </>
                            ) : (
                              <>
                                <FaFilePdf
                                  className="text-danger me-2"
                                  size={13}
                                />

                                <span className="small fw-semibold">
                                  {/* Resume */}
                                </span>
                              </>
                            )}
                          </button>
                        )}

                        <button
                          type="button"
                          className="btn btn-light border ats-history-action"
                          style={{
                            width: '36px',
                          }}
                          disabled={deleting === scan._id}
                          onClick={() =>
                            remove(scan._id)
                          }
                          title="Delete analysis"
                        >
                          {deleting === scan._id ? (
                            <span className="spinner-border spinner-border-sm text-danger" />
                          ) : (
                            <FaTrash
                              className="text-danger"
                              size={13}
                            />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Empty State */
          <div
            className="card border-0 rounded-4"
            style={{
              boxShadow:
                '0 8px 30px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div className="card-body py-5">
              <div
                className="text-center mx-auto"
                style={{
                  maxWidth: '540px',
                }}
              >
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-4"
                  style={{
                    width: '80px',
                    height: '80px',
                    background:
                      'linear-gradient(135deg, #eef2ff, #e0e7ff)',
                  }}
                >
                  <FaChartLine
                    className="text-primary"
                    size={28}
                  />
                </div>

                <h3
                  className="fw-bold mb-2"
                  style={{
                    color: '#111827',
                    letterSpacing: '-0.5px',
                  }}
                >
                  No analyses yet
                </h3>

                <p className="text-secondary lh-lg mb-4">
                  Run your first ATS analysis to understand how
                  well your resume matches a target job and start
                  tracking your improvement.
                </p>

                <Link
                  to="/student/ats-scanner"
                  className="btn btn-primary px-4 py-2 rounded-3 fw-semibold"
                >
                  Start Your First Analysis
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default AtsHistory;