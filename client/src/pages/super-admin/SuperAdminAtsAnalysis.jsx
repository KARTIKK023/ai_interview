import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaEye,
  FaTrash,
  FaChartLine,
  FaFileAlt,
  FaFilePdf,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import API from '../../services/api';

const scoreClass = (score) => {
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  return 'danger';
};

const normalizeScan = (scan = {}) => ({
  ...scan,
  overallScore: Number(scan.overallScore ?? scan.score ?? 0),
  scores: scan.scores || {},
  matchedSkills: scan.matchedSkills || [],
  missingSkills: scan.missingSkills || [],
  tailoredResume: scan.tailoredResume || null,
  optimization: scan.optimization || null
});

const SuperAdminAtsAnalysis = () => {
  const navigate = useNavigate();

  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openingResume, setOpeningResume] = useState('');
  const [selectedScan, setSelectedScan] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const response = await API.get('/admin/ats/analysis-history');
      const rawScans = response.data?.scans || response.data?.analysisHistory || [];
      setScans(rawScans.map(normalizeScan));
    } catch (error) {
      toast.error('Unable to load ATS history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const viewResume = async (scanId) => {
    try {
      setOpeningResume(scanId);
      const response = await API.get(`/ats/scans/${scanId}/optimized-resume`, { responseType: 'blob' });
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = window.URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => {
        window.URL.revokeObjectURL(pdfUrl);
      }, 30000);
    } catch (error) {
      toast.error('Unable to open the generated resume.');
    } finally {
      setOpeningResume('');
    }
  };

  return (
    <div className="p-4" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
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
              minmax(150px, 1.2fr);
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
        `}
      </style>

      <div className="container-fluid px-0">
        {/* Top Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
          <div>
            <button
              onClick={() => navigate('/super-admin/dashboard')}
              className="btn btn-link text-decoration-none text-secondary p-0 small fw-semibold"
            >
              <FaArrowLeft className="me-2" />
              Back to Dashboard
            </button>

            <div className="d-flex align-items-center mt-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-4 me-3"
                style={{
                  width: '52px',
                  height: '52px',
                  background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
                }}
              >
                <FaChartLine className="text-primary" size={21} />
              </div>

              <div>
                <h2
                  className="fw-bold mb-1"
                  style={{ color: '#111827', letterSpacing: '-0.8px' }}
                >
                  ATS Analysis History
                </h2>

                <p className="text-secondary mb-0">
                  Track your resume performance across different job applications.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => load()}
            className="btn btn-primary px-4 py-2 rounded-3 fw-semibold"
          >
            Refresh History
          </button>
        </div>

        {/* Content Card */}
        {loading ? (
          <div className="card border-0 rounded-4 shadow-sm">
            <div className="card-body py-5 text-center">
              <div className="spinner-border text-primary mb-3" style={{ width: '2rem', height: '2rem' }} />
              <p className="text-secondary mb-0">Loading ATS analysis history...</p>
            </div>
          </div>
        ) : scans.length ? (
          <div className="card border-0 rounded-4 overflow-hidden shadow-sm">
            <div style={{ minWidth: '1100px' }}>
              {/* Header */}
              <div className="ats-history-grid ats-history-header">
                <div className="ats-history-cell">
                  <span className="small fw-bold text-secondary">TARGET JOB</span>
                </div>
                <div className="ats-history-cell">
                  <span className="small fw-bold text-secondary">COMPANY</span>
                </div>
                <div className="ats-history-cell">
                  <span className="small fw-bold text-secondary">ATS SCORE</span>
                </div>
                <div className="ats-history-cell">
                  <span className="small fw-bold text-secondary">PROJECTED SCORE</span>
                </div>
                <div className="ats-history-cell">
                  <span className="small fw-bold text-secondary">ANALYZED</span>
                </div>
                <div className="ats-history-cell text-end">
                  <span className="small fw-bold text-secondary">ACTIONS</span>
                </div>
              </div>

              {/* Rows */}
              {scans.map((scan) => {
                const score = scan.overallScore ?? 0;
                const color = scoreClass(score);

                const projectedScore = Number.isFinite(scan.optimization?.projectedScore)
                  ? scan.optimization.projectedScore
                  : (Number.isFinite(scan.projectedScore) ? scan.projectedScore : null);

                const scoreIncrease = projectedScore !== null ? projectedScore - score : null;
                const targetJobTitle = scan.targetJobRole || scan.targetJob?.target_job_role || 'Target Job';
                const companyName = scan.company || scan.targetJob?.target_company || '—';

                return (
                  <div key={scan._id} className="ats-history-grid ats-history-row">
                    {/* Target Job */}
                    <div className="ats-history-cell">
                      <div className="d-flex align-items-center">
                        <div
                          className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0 me-3"
                          style={{ width: '44px', height: '44px', backgroundColor: '#f1f3f8' }}
                        >
                          <FaFileAlt size={17} className="text-primary" />
                        </div>

                        <div className="min-width-0" style={{ minWidth: 0 }}>
                          <div className="fw-semibold text-dark ats-history-title" title={targetJobTitle}>
                            {targetJobTitle}
                          </div>
                          <div className="small text-secondary mt-1">
                            {scan.studentName ? `${scan.studentName} (${scan.studentId})` : 'Resume analysis'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Company */}
                    <div className="ats-history-cell">
                      <div className="fw-medium text-dark ats-history-title" title={companyName}>
                        {companyName}
                      </div>
                    </div>

                    {/* ATS Score */}
                    <div className="ats-history-cell">
                      <div className="ats-history-score">
                        <div className="ats-history-score-bar">
                          <div
                            className={`ats-history-score-bar-fill bg-${color}`}
                            style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
                          />
                        </div>

                        <div>
                          <div className={`fw-bold text-${color}`}>
                            {score}<span className="text-secondary fw-normal">/100</span>
                          </div>
                          <div className="small text-secondary">Current</div>
                        </div>
                      </div>
                    </div>

                    {/* Projected Score */}
                    <div className="ats-history-cell">
                      {projectedScore !== null ? (
                        <div className="ats-history-projected">
                          <div className="ats-history-projected-icon">
                            <FaChartLine size={15} className="text-primary" />
                          </div>

                          <div>
                            <div className="d-flex align-items-center gap-2">
                              <span className="fw-bold text-primary">
                                {projectedScore}<span className="text-secondary fw-normal">/100</span>
                              </span>

                              {scoreIncrease > 0 && (
                                <span className="badge rounded-pill bg-success-subtle text-success" style={{ fontSize: '11px' }}>
                                  ↑ {scoreIncrease}
                                </span>
                              )}
                            </div>
                            <div className="small text-secondary">After optimization</div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-secondary">—</span>
                      )}
                    </div>

                    {/* Date */}
                    <div className="ats-history-cell">
                      <span className="text-secondary text-nowrap">
                        {scan.analyzedAt || scan.createdAt
                          ? new Date(scan.analyzedAt || scan.createdAt).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })
                          : '—'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="ats-history-cell">
                      <div className="ats-history-actions">
                        <button
                          type="button"
                          className="btn btn-light border ats-history-action px-3"
                          onClick={() => setSelectedScan(scan)}
                          title="View Details"
                        >
                          <FaEye className="text-primary" size={13} />
                        </button>

                        <button
                          type="button"
                          className="btn btn-light border ats-history-action px-3"
                          onClick={() => viewResume(scan._id)}
                          disabled={openingResume === scan._id}
                          title="View Optimized Resume PDF"
                        >
                          <FaFilePdf className="text-danger" size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="card border-0 rounded-4 shadow-sm p-5 text-center text-muted">
            <p className="mb-0">No ATS analysis records found.</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedScan && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title fw-bold">ATS Analysis Details</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedScan(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <span className="text-muted small d-block">Student</span>
                  <strong className="fs-6 text-dark">{selectedScan.studentName || 'Student'} ({selectedScan.studentId || 'N/A'})</strong>
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <span className="text-muted small d-block">Target Job Role</span>
                    <strong className="text-dark">{selectedScan.targetJobRole || selectedScan.targetJob?.target_job_role || 'Target Job'}</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted small d-block">Target Company</span>
                    <strong className="text-dark">{selectedScan.company || selectedScan.targetJob?.target_company || '—'}</strong>
                  </div>
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <span className="text-muted small d-block">ATS Score</span>
                    <strong className="fs-5 text-primary">{selectedScan.overallScore ?? 0}/100</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted small d-block">Projected Score</span>
                    <strong className="fs-5 text-success">
                      {selectedScan.projectedScore ?? '—'}
                    </strong>
                  </div>
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedScan(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminAtsAnalysis;
