import React, { useState, useEffect, useMemo } from 'react';
import API from '../../services/api';
import DataTable from './components/DataTable';
import SuperAdminStudentProfileView from './components/SuperAdminStudentProfileView';
import {
  FaFileAlt,
  FaFilePdf,
  FaSync,
  FaCheckCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';

/* =========================================================
   DATE FORMATTER
========================================================= */
const formatDate = (date) => {
  if (!date) return '—';
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return '—';
  }
  return parsedDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

/* =========================================================
   MAIN COMPONENT
========================================================= */
const SuperAdminAtsResumeScans = () => {
  /* DATA STATES */
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* FILTER STATES */
  const [monthFilter, setMonthFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  /* ACTION STATES */
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [openingResume, setOpeningResume] = useState('');

  /* FETCH RECORDS FROM ATS API */
  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get('/admin/ats-resume-scans');
      if (res.data && res.data.success) {
        const recordsWithSerial = (res.data.records || []).map((r, idx) => ({
          ...r,
          serialNumber: idx + 1
        }));
        setRecords(recordsWithSerial);
      } else {
        setError('Failed to fetch ATS scan records from server.');
      }
    } catch (err) {
      console.error('Failed to load ATS resume scans:', err);
      const msg =
        err.response?.data?.message ||
        'Failed to fetch ATS resume scan records from database.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  /* DOWNLOAD / VIEW OPTIMIZED RESUME PDF */
  const handleDownloadResume = async (scanId, fileName) => {
    try {
      setOpeningResume(scanId);
      toast.loading(`Opening ${fileName || 'resume'}...`, { id: 'pdf-load' });
      const res = await API.get(`/admin/ats/scans/${scanId}/optimized-resume`, {
        responseType: 'blob'
      }).catch(() =>
        API.get(`/ats/scans/${scanId}/optimized-resume`, {
          responseType: 'blob'
        })
      );
      const fileBlob = new Blob([res.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(fileBlob);
      window.open(fileURL, '_blank', 'noopener,noreferrer');
      toast.success(`Opened ${fileName || 'resume'} in new tab`, { id: 'pdf-load' });
      setTimeout(() => {
        URL.revokeObjectURL(fileURL);
      }, 30000);
    } catch (err) {
      console.error('Failed to view resume file:', err);
      toast.error('Failed to open resume PDF file from database.', { id: 'pdf-load' });
    } finally {
      setOpeningResume('');
    }
  };

  /* CLEAR FILTERS */
  const handleClearFilters = () => {
    setMonthFilter('');
    setFromDate('');
    setToDate('');
    toast.success('Filters cleared');
  };

  /* FILTER RECORDS */
  const filteredRecords = useMemo(() => {
    let result = [...records];

    if (monthFilter) {
      result = result.filter((item) => {
        if (!item.analyzedAt) return false;
        const date = new Date(item.analyzedAt);
        if (Number.isNaN(date.getTime())) return false;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}` === monthFilter;
      });
    }

    if (fromDate) {
      const from = new Date(`${fromDate}T00:00:00`);
      result = result.filter((item) => {
        if (!item.analyzedAt) return false;
        return new Date(item.analyzedAt) >= from;
      });
    }

    if (toDate) {
      const to = new Date(`${toDate}T23:59:59.999`);
      result = result.filter((item) => {
        if (!item.analyzedAt) return false;
        return new Date(item.analyzedAt) <= to;
      });
    }

    return result;
  }, [records, monthFilter, fromDate, toDate]);

  /* DATATABLE COLUMN DEFINITIONS */
  const columns = [
    {
      title: '<span style="display:block; width:60px; text-align:center;">S.No.</span>',
      data: 'serialNumber',
      orderable: false,
      searchable: false,
      render: (data, _type, _row, meta) => `
        <span style="display:block; width:60px; text-align:center;" class="fw-bold">
          ${data || meta.row + 1}.
        </span>
      `
    },
    {
      title: 'Student Name',
      data: 'studentName',
      render: (data, _type, row) => {
        const name = data || row.studentName || 'Student';
        const targetId = row.studentUserId || row.studentId || row.userId || row._id;
        return `
          <a
            href="#"
            class="view-student-profile text-decoration-none fw-bold"
            style="color:#6D28D9;"
            data-id="${targetId || ''}"
            title="Click to view full student profile"
          >
            ${name}
          </a>
        `;
      }
    },
    {
      title: 'Student ID',
      data: 'studentId',
      render: (data) => `
        <span class="badge font-monospace fw-bold" style="background:#e9ecef; color:#dc3545;">
          ${data || 'N/A'}
        </span>
      `
    },
    {
      title: 'File Name',
      data: 'fileName',
      render: (data) => `
        <span class="d-inline-flex align-items-center gap-1 fw-semibold">
          <i class="fas fa-file-pdf text-danger me-1"></i>
          <span class="text-dark text-truncate" style="max-width:200px;" title="${data || 'ATS-Resume.pdf'}">
            ${data || 'ATS-Resume.pdf'}
          </span>
        </span>
      `
    },
    {
      title: 'Target Job',
      data: 'targetJob',
      render: (data) => `<span class="fw-semibold text-dark">${data || 'Target Job'}</span>`
    },
    {
      title: 'Company',
      data: 'company',
      render: (data) => `<span class="text-secondary">${data || '—'}</span>`
    },
    {
      title: 'ATS Score',
      data: 'atsScore',
      render: (data) => {
        const score = Number(data) || 0;
        let badgeClass = 'bg-danger text-white';
        if (score >= 80) badgeClass = 'bg-success text-white';
        else if (score >= 50) badgeClass = 'bg-warning text-dark';
        return `<span class="badge rounded-pill px-3 py-2 fw-bold ${badgeClass}">${score}/100</span>`;
      }
    },
    {
      title: 'Projected Score',
      data: 'projectedScore',
      render: (data) => {
        if (data === null || data === undefined) {
          return '<span class="text-muted">—</span>';
        }
        return `
          <span class="badge rounded-pill px-3 py-2 fw-bold" style="background:#cff4fc; color:#087990;">
            ${data}/100
          </span>
        `;
      }
    },
    {
      title: 'Analyzed Date',
      data: 'analyzedAt',
      render: (data) => `<span class="small text-secondary text-nowrap">${formatDate(data)}</span>`
    },
    {
      title: 'ATS Status',
      data: 'status',
      render: (data) => `
        <span class="badge d-inline-flex align-items-center gap-1 fw-semibold" style="background:#e8f7ef; color:#198754; border:1px solid #198754;">
          <i class="fas fa-check-circle me-1"></i>
          ${data || 'Parsed'}
        </span>
      `
    },
    {
      title: 'Actions',
      data: null,
      orderable: false,
      searchable: false,
      render: (_data, _type, row) => `
        <div class="d-flex justify-content-center align-items-center gap-2">
          <button
            type="button"
            class="btn btn-sm btn-outline-primary ats-view-btn d-inline-flex align-items-center gap-1"
            data-id="${row._id}"
            title="View Scan Details"
          >
            <i class="fas fa-eye me-1"></i>
          </button>
          <button
            type="button"
            class="btn btn-sm btn-outline-danger ats-pdf-btn d-inline-flex align-items-center gap-1"
            data-id="${row._id}"
            data-file="${row.fileName || 'ATS-Resume.pdf'}"
            title="Open Resume PDF"
          >
            <i class="fas fa-file-pdf me-1"></i>
          </button>
        </div>
      `
    }
  ];

  /* LISTEN FOR TABLE CLICK EVENTS (VIEW RECORD & DOWNLOAD PDF) */
  useEffect(() => {
    const handleTableClick = (event) => {
      const viewBtn = event.target.closest('.ats-view-btn');
      if (viewBtn) {
        event.preventDefault();
        const recordId = viewBtn.dataset.id;
        const rec = records.find((item) => String(item._id) === String(recordId));
        if (rec) {
          setSelectedRecord(rec);
        }
        return;
      }

      const pdfBtn = event.target.closest('.ats-pdf-btn');
      if (pdfBtn) {
        event.preventDefault();
        const recordId = pdfBtn.dataset.id;
        const fileName = pdfBtn.dataset.file;
        handleDownloadResume(recordId, fileName);
      }
    };

    document.addEventListener('click', handleTableClick);
    return () => {
      document.removeEventListener('click', handleTableClick);
    };
  }, [records]);

  /* RENDER STUDENT PROFILE VIEW IF STUDENT CLICKED */
  if (selectedStudentId) {
    return (
      <div className="p-3.5">
        <SuperAdminStudentProfileView
          studentId={selectedStudentId}
          onBack={() => setSelectedStudentId(null)}
          backTitle="Back to ATS Resume Scans"
        />
      </div>
    );
  }

  return (
    <div className="p-3.5">
      {/* 1. PAGE HEADER */}
      <div className="card border-0 shadow-sm p-3 mb-3 rounded-3 text-white" style={{ background: '#4C1D95' }}>
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <FaFileAlt size={22} className="text-white" />
            <h5 className="fw-bold mb-0 text-white">ATS Resume Scan Records ({records.length})</h5>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button type="button" className="btn btn-sm btn-outline-light" onClick={fetchRecords} disabled={loading}>
              <FaSync size={12} className={loading ? 'spin' : ''} />
              <span className="ms-1">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. FILTER SECTION */}
      <div className="card border-0 shadow-sm mb-3 rounded-3">
        <div className="card-body py-3">
          <div className="row g-3 align-items-end">
            {/* Search by Month */}
            <div className="col-md-3">
              <label className="form-label fw-semibold">Search by Month</label>
              <input
                type="month"
                className="form-control"
                value={monthFilter}
                onChange={(e) => {
                  setMonthFilter(e.target.value);
                  setFromDate('');
                  setToDate('');
                }}
              />
            </div>

            {/* From Date */}
            <div className="col-md-3">
              <label className="form-label fw-semibold">From Date</label>
              <input
                type="date"
                className="form-control"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setMonthFilter('');
                }}
              />
            </div>

            {/* To Date */}
            <div className="col-md-3">
              <label className="form-label fw-semibold">To Date</label>
              <input
                type="date"
                className="form-control"
                value={toDate}
                min={fromDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setMonthFilter('');
                }}
              />
            </div>

            {/* Clear Filters */}
            <div className="col-md-2">
              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={handleClearFilters}
              >
                Clear Filters
              </button>
            </div>

            {/* Records Count */}
            <div className="col-md-1">
              <div className="text-muted small">Records</div>
              <div className="fw-bold fs-5 text-primary">{filteredRecords.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. REUSABLE DATA TABLE */}
      <DataTable
        title="ATS Resume Scans Records"
        columns={columns}
        data={filteredRecords}
        loading={loading}
        onStudentClick={(id) => setSelectedStudentId(id)}
      />

      {/* 4. SCAN DETAILS MODAL */}
      {selectedRecord && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header text-white" style={{ background: '#4C1D95' }}>
                <div>
                  <h5 className="modal-title fw-bold mb-0">ATS Resume Scan Details</h5>
                  <small className="opacity-75">Resume analysis information</small>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedRecord(null)}
                />
              </div>

              <div className="modal-body p-4">
                <div className="row g-4">
                  <div className="col-md-6">
                    <small className="text-muted d-block mb-1">Student Name</small>
                    <strong>{selectedRecord.studentName || 'Student'}</strong>
                  </div>

                  <div className="col-md-6">
                    <small className="text-muted d-block mb-1">Student ID</small>
                    <span className="badge font-monospace" style={{ background: '#e9ecef', color: '#dc3545' }}>
                      {selectedRecord.studentId || 'N/A'}
                    </span>
                  </div>

                  <div className="col-12">
                    <small className="text-muted d-block mb-1">File Name</small>
                    <div className="d-flex align-items-center gap-2">
                      <FaFilePdf className="text-danger" />
                      <strong>{selectedRecord.fileName || 'ATS-Resume.pdf'}</strong>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <small className="text-muted d-block mb-1">Target Job</small>
                    <strong>{selectedRecord.targetJob || 'Target Job'}</strong>
                  </div>

                  <div className="col-md-6">
                    <small className="text-muted d-block mb-1">Company</small>
                    <strong>{selectedRecord.company || '—'}</strong>
                  </div>

                  <div className="col-md-6">
                    <small className="text-muted d-block mb-1">ATS Score</small>
                    <span
                      className={`badge rounded-pill fs-6 px-3 py-2 ${
                        (selectedRecord.atsScore || 0) >= 80
                          ? 'bg-success text-white'
                          : (selectedRecord.atsScore || 0) >= 50
                          ? 'bg-warning text-dark'
                          : 'bg-danger text-white'
                      }`}
                    >
                      {selectedRecord.atsScore ?? 0}/100
                    </span>
                  </div>

                  <div className="col-md-6">
                    <small className="text-muted d-block mb-1">Projected Score</small>
                    {selectedRecord.projectedScore !== null && selectedRecord.projectedScore !== undefined ? (
                      <span className="badge rounded-pill fs-6 px-3 py-2" style={{ background: '#cff4fc', color: '#087990' }}>
                        {selectedRecord.projectedScore}/100
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </div>

                  <div className="col-md-6">
                    <small className="text-muted d-block mb-1">Analyzed Date</small>
                    <span>
                      {selectedRecord.analyzedAt
                        ? new Date(selectedRecord.analyzedAt).toLocaleString()
                        : '—'}
                    </span>
                  </div>

                  <div className="col-md-6">
                    <small className="text-muted d-block mb-1">ATS Status</small>
                    <span
                      className="badge d-inline-flex align-items-center gap-1"
                      style={{ background: '#e8f7ef', color: '#198754', border: '1px solid #198754' }}
                    >
                      <FaCheckCircle size={10} />
                      {selectedRecord.status || 'Parsed'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-light">
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDownloadResume(selectedRecord._id, selectedRecord.fileName)}
                  disabled={openingResume === selectedRecord._id}
                >
                  <FaFilePdf size={12} className="me-1" />
                  View / Download PDF
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedRecord(null)}
                >
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

export default SuperAdminAtsResumeScans;