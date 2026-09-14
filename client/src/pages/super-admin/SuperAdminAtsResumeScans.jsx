import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import {
  FaFileAlt,
  FaArrowLeft,
  FaSearch,
  FaCheckCircle,
  FaFilePdf,
  FaEye,
  FaSync,
  FaExclamationTriangle,
  FaFileCsv,
  FaFileExcel,
  FaPrint,
  FaSort,
  FaSortUp,
  FaSortDown
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

const scoreBadgeClass = (score) => {
  const num = Number(score) || 0;
  if (num >= 80) return 'bg-success text-white';
  if (num >= 50) return 'bg-warning text-dark';
  return 'bg-danger text-white';
};

const SuperAdminAtsResumeScans = () => {
  const navigate = useNavigate();

  // Data States
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Table Control States
  const [globalSearch, setGlobalSearch] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Sorting State
  const [sortField, setSortField] = useState('serialNumber');
  const [sortDirection, setSortDirection] = useState('asc');

  // Action States
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [openingResume, setOpeningResume] = useState('');

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get('/admin/ats-resume-scans');
      if (res.data && res.data.success) {
        setRecords(res.data.records || []);
      } else {
        setError('Failed to fetch ATS scan records from server.');
      }
    } catch (err) {
      console.error('Failed to load ATS resume scans:', err);
      const msg = err.response?.data?.message || 'Failed to fetch ATS resume scan records from database.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadResume = async (scanId, fileName) => {
    try {
      setOpeningResume(scanId);
      toast.loading(`Opening ${fileName || 'resume'}...`, { id: 'pdf-load' });
      const res = await API.get(`/ats/scans/${scanId}/optimized-resume`, { responseType: 'blob' });
      const fileBlob = new Blob([res.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(fileBlob);
      window.open(fileURL, '_blank', 'noopener,noreferrer');
      toast.success(`Opened ${fileName || 'resume'} in new tab`, { id: 'pdf-load' });
      setTimeout(() => URL.revokeObjectURL(fileURL), 30000);
    } catch (err) {
      console.error('Failed to view resume file:', err);
      toast.error('Failed to open resume PDF file from database.', { id: 'pdf-load' });
    } finally {
      setOpeningResume('');
    }
  };

  // Sort Handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Render Sort Icon
  const renderSortIcon = (field) => {
    if (sortField !== field) return <FaSort size={11} className="ms-1 opacity-50" />;
    return sortDirection === 'asc' ? (
      <FaSortUp size={11} className="ms-1 text-info" />
    ) : (
      <FaSortDown size={11} className="ms-1 text-info" />
    );
  };

  // Filtered and Sorted Records
  const filteredAndSortedRecords = useMemo(() => {
    return records
      .filter((item) => {
        const query = (globalSearch || tableSearch || '').toLowerCase().trim();
        if (!query) return true;
        return (
          (item.studentName || '').toLowerCase().includes(query) ||
          (item.studentId || '').toLowerCase().includes(query) ||
          (item.fileName || '').toLowerCase().includes(query) ||
          (item.targetJob || '').toLowerCase().includes(query) ||
          (item.company || '').toLowerCase().includes(query) ||
          (item.status || '').toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (valA === null || valA === undefined) valA = '';
        if (valB === null || valB === undefined) valB = '';

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }

        if (sortField === 'analyzedAt') {
          const dateA = new Date(valA).getTime() || 0;
          const dateB = new Date(valB).getTime() || 0;
          return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();

        if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
        if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [records, globalSearch, tableSearch, sortField, sortDirection]);

  // Reset to page 1 on search / entries change
  useEffect(() => {
    setCurrentPage(1);
  }, [globalSearch, tableSearch, entriesPerPage]);

  // Pagination Variables
  const totalRecords = filteredAndSortedRecords.length;
  const totalPages = Math.ceil(totalRecords / entriesPerPage) || 1;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, totalRecords);
  const currentRecords = filteredAndSortedRecords.slice(startIndex, endIndex);

  // Export CSV Handler
  const handleExportCSV = () => {
    if (!filteredAndSortedRecords.length) {
      toast.error('No data available to export');
      return;
    }

    const headers = [
      'S.No.',
      'Student Name',
      'Student ID',
      'File Name',
      'Target Job',
      'Company',
      'ATS Score',
      'Projected Score',
      'Analyzed Date',
      'ATS Status'
    ];

    const rows = filteredAndSortedRecords.map((r, i) => [
      i + 1,
      `"${r.studentName || 'Student'}"`,
      `"${r.studentId || 'N/A'}"`,
      `"${r.fileName || 'ATS-Resume.pdf'}"`,
      `"${r.targetJob || 'Target Job'}"`,
      `"${r.company || '—'}"`,
      `"${r.atsScore}/100"`,
      `"${r.projectedScore !== null && r.projectedScore !== undefined ? r.projectedScore + '/100' : '—'}"`,
      `"${r.analyzedAt ? new Date(r.analyzedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}"`,
      `"${r.status || 'Parsed'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ATS_Resume_Scans_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exported CSV successfully');
  };

  // Export Excel Handler
  const handleExportExcel = () => {
    if (!filteredAndSortedRecords.length) {
      toast.error('No data available to export');
      return;
    }

    const exportData = filteredAndSortedRecords.map((r, i) => ({
      'S.No.': i + 1,
      'Student Name': r.studentName || 'Student',
      'Student ID': r.studentId || 'N/A',
      'File Name': r.fileName || 'ATS-Resume.pdf',
      'Target Job': r.targetJob || 'Target Job',
      Company: r.company || '—',
      'ATS Score': `${r.atsScore}/100`,
      'Projected Score': r.projectedScore !== null && r.projectedScore !== undefined ? `${r.projectedScore}/100` : '—',
      'Analyzed Date': r.analyzedAt
        ? new Date(r.analyzedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : '—',
      'ATS Status': r.status || 'Parsed'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ATS Resume Scans');
    XLSX.writeFile(workbook, `ATS_Resume_Scans_${Date.now()}.xlsx`);
    toast.success('Exported Excel successfully');
  };

  // Print Handler
  const handlePrint = () => {
    if (!filteredAndSortedRecords.length) {
      toast.error('No data available to print');
      return;
    }

    const printWindow = window.open('', '_blank');
    const printRows = filteredAndSortedRecords
      .map(
        (r, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${r.studentName || 'Student'}</td>
        <td>${r.studentId || 'N/A'}</td>
        <td>${r.fileName || 'ATS-Resume.pdf'}</td>
        <td>${r.targetJob || 'Target Job'}</td>
        <td>${r.company || '—'}</td>
        <td>${r.atsScore}/100</td>
        <td>${r.projectedScore !== null && r.projectedScore !== undefined ? r.projectedScore + '/100' : '—'}</td>
        <td>${r.analyzedAt ? new Date(r.analyzedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
        <td>${r.status || 'Parsed'}</td>
      </tr>
    `
      )
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>ATS Resume Scan Records Print</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 20px; }
            h2 { margin-bottom: 5px; color: #4C1D95; }
            p { color: #666; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; font-size: 13px; }
            th { background-color: #4C1D95; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <h2>ATS Resume Scan Master Table</h2>
          <p>Total Records: ${filteredAndSortedRecords.length} | Generated: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>S.No.</th>
                <th>Student Name</th>
                <th>Student ID</th>
                <th>File Name</th>
                <th>Target Job</th>
                <th>Company</th>
                <th>ATS Score</th>
                <th>Projected Score</th>
                <th>Analyzed Date</th>
                <th>ATS Status</th>
              </tr>
            </thead>
            <tbody>
              ${printRows}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-vh-100 bg-light d-flex flex-column" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* 1. TOP HEADER */}
      <header
        className="px-4 py-3 text-white d-flex align-items-center justify-content-between shadow-sm"
        style={{ background: 'linear-gradient(90deg, #09071B 0%, #110D33 50%, #171242 100%)' }}
      >
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-outline-light btn-sm d-flex align-items-center gap-1 rounded-2"
            onClick={() => navigate('/super-admin/dashboard')}
          >
            <FaArrowLeft size={12} /> Dashboard
          </button>
          <div className="d-flex align-items-center gap-2">
            <FaFileAlt className="text-warning" size={20} />
            <h5 className="fw-bold mb-0 text-white">ATS Resume Scan Records ({records.length})</h5>
          </div>
        </div>

        <button
          className="btn btn-sm btn-outline-info d-flex align-items-center gap-1 rounded-2"
          onClick={fetchRecords}
          disabled={loading}
        >
          <FaSync className={loading ? 'spin' : ''} size={12} /> Refresh Data
        </button>
      </header>

      <main className="container-fluid p-4 flex-grow-1">
        {/* 2. SEARCH AREA */}
        <div className="card border-0 shadow-sm p-3 mb-4 rounded-3">
          <div className="row align-items-center g-3">
            <div className="col-md-6">
              <div className="position-relative">
                <FaSearch className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" size={14} />
                <input
                  type="text"
                  className="form-control ps-5"
                  placeholder="Search student name, student ID, file name, target job, company..."
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6 text-md-end text-muted small">
              Total <strong className="text-dark">{records.length}</strong> ATS resume scan record(s) found in MongoDB
            </div>
          </div>
        </div>

        {/* 3. PURPLE MASTER TABLE HEADER BAR */}
        <div
          className="card border-0 shadow-sm p-3 mb-3 rounded-3 text-white"
          style={{ background: '#4C1D95' }}
        >
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-2">
              <FaFileAlt className="text-white" size={20} />
              <h5 className="fw-bold mb-0 text-white">ATS Resume Scans Master Table</h5>
              <span className="badge rounded-pill px-3 py-1 bg-white bg-opacity-20 text-white border border-white border-opacity-30">
                {records.length} MongoDB Records
              </span>
            </div>

            {/* EXPORT BUTTONS */}
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-sm btn-success d-inline-flex align-items-center gap-1 fw-semibold rounded-2"
                onClick={handleExportCSV}
              >
                <FaFileCsv size={14} /> Export CSV
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-light d-inline-flex align-items-center gap-1 fw-semibold rounded-2"
                onClick={handleExportExcel}
              >
                <FaFileExcel size={14} /> Export Excel
              </button>
              <button
                type="button"
                className="btn btn-sm btn-warning text-dark d-inline-flex align-items-center gap-1 fw-semibold rounded-2"
                onClick={handlePrint}
              >
                <FaPrint size={14} /> Print
              </button>
            </div>
          </div>
        </div>

        {/* 4. MASTER TABLE CONTAINER & CONTROLS */}
        <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white">
          {/* TABLE CONTROLS BAR (ENTRIES PER PAGE + TABLE SEARCH) */}
          <div className="p-3 bg-light border-bottom d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-2">
              <select
                className="form-select form-select-sm"
                style={{ width: '80px' }}
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-muted small">entries per page</span>
            </div>

            <div className="d-flex align-items-center gap-2">
              <label className="text-muted small fw-semibold">Search:</label>
              <input
                type="text"
                className="form-control form-control-sm"
                style={{ width: '220px' }}
                placeholder="Filter table records..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
              />
            </div>
          </div>

          {/* TABLE AREA */}
          {loading ? (
            <div className="p-5 text-center text-muted">
              <div className="spinner-border text-info mb-3" role="status" style={{ width: '2.5rem', height: '2.5rem' }}></div>
              <p className="mb-0 fw-semibold text-secondary">Loading ATS scan records from database...</p>
            </div>
          ) : error ? (
            <div className="p-5 text-center text-danger">
              <FaExclamationTriangle size={36} className="mb-2 text-warning" />
              <h6 className="fw-bold">{error}</h6>
              <button className="btn btn-sm btn-primary mt-2" onClick={fetchRecords}>
                Retry Loading
              </button>
            </div>
          ) : currentRecords.length === 0 ? (
            <div className="p-5 text-center text-muted">
              <FaFileAlt size={36} className="mb-2 text-secondary opacity-50" />
              <p className="mb-0 fw-semibold">No ATS resume scan records found.</p>
              {(globalSearch || tableSearch) && <span className="small text-muted">Try adjusting your search query.</span>}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ width: '100%' }}>
                {/* 11 COLUMNS HEADER - NO CHECKBOXES */}
                <thead style={{ background: '#4C1D95', color: '#FFFFFF' }}>
                  <tr>
                    <th style={{ width: '60px', color: '#FFFFFF' }}>S.No.</th>

                    <th
                      style={{ cursor: 'pointer', color: '#FFFFFF' }}
                      onClick={() => handleSort('studentName')}
                      title="Sort by Student Name"
                    >
                      <span className="d-inline-flex align-items-center">
                        Student Name {renderSortIcon('studentName')}
                      </span>
                    </th>

                    <th
                      style={{ cursor: 'pointer', color: '#FFFFFF' }}
                      onClick={() => handleSort('studentId')}
                      title="Sort by Student ID"
                    >
                      <span className="d-inline-flex align-items-center">
                        Student ID {renderSortIcon('studentId')}
                      </span>
                    </th>

                    <th
                      style={{ cursor: 'pointer', color: '#FFFFFF' }}
                      onClick={() => handleSort('fileName')}
                      title="Sort by File Name"
                    >
                      <span className="d-inline-flex align-items-center">
                        File Name {renderSortIcon('fileName')}
                      </span>
                    </th>

                    <th
                      style={{ cursor: 'pointer', color: '#FFFFFF' }}
                      onClick={() => handleSort('targetJob')}
                      title="Sort by Target Job"
                    >
                      <span className="d-inline-flex align-items-center">
                        Target Job {renderSortIcon('targetJob')}
                      </span>
                    </th>

                    <th
                      style={{ cursor: 'pointer', color: '#FFFFFF' }}
                      onClick={() => handleSort('company')}
                      title="Sort by Company"
                    >
                      <span className="d-inline-flex align-items-center">
                        Company {renderSortIcon('company')}
                      </span>
                    </th>

                    <th
                      style={{ cursor: 'pointer', color: '#FFFFFF' }}
                      onClick={() => handleSort('atsScore')}
                      title="Sort by ATS Score"
                    >
                      <span className="d-inline-flex align-items-center">
                        ATS Score {renderSortIcon('atsScore')}
                      </span>
                    </th>

                    <th
                      style={{ cursor: 'pointer', color: '#FFFFFF' }}
                      onClick={() => handleSort('projectedScore')}
                      title="Sort by Projected Score"
                    >
                      <span className="d-inline-flex align-items-center">
                        Projected Score {renderSortIcon('projectedScore')}
                      </span>
                    </th>

                    <th
                      style={{ cursor: 'pointer', color: '#FFFFFF' }}
                      onClick={() => handleSort('analyzedAt')}
                      title="Sort by Analyzed Date"
                    >
                      <span className="d-inline-flex align-items-center">
                        Analyzed Date {renderSortIcon('analyzedAt')}
                      </span>
                    </th>

                    <th
                      style={{ cursor: 'pointer', color: '#FFFFFF' }}
                      onClick={() => handleSort('status')}
                      title="Sort by ATS Status"
                    >
                      <span className="d-inline-flex align-items-center">
                        ATS Status {renderSortIcon('status')}
                      </span>
                    </th>

                    <th className="text-end pe-4" style={{ color: '#FFFFFF' }}>
                      Actions
                    </th>
                  </tr>
                </thead>

                {/* TABLE BODY */}
                <tbody>
                  {currentRecords.map((item, index) => {
                    const serialNum = startIndex + index + 1;
                    const analyzedDate = item.analyzedAt
                      ? new Date(item.analyzedAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })
                      : '—';

                    return (
                      <tr key={item._id || index}>
                        <td className="fw-bold text-secondary">{serialNum}.</td>

                        {/* Student Name */}
                        <td>
                          <span className="fw-bold text-dark">{item.studentName || 'Student'}</span>
                        </td>

                        {/* Student ID */}
                        <td>
                          <span className="badge bg-secondary-subtle text-danger font-monospace fw-bold">
                            {item.studentId || 'N/A'}
                          </span>
                        </td>

                        {/* File Name */}
                        <td>
                          <span className="d-inline-flex align-items-center gap-1.5 fw-semibold text-purple">
                            <FaFilePdf className="text-danger flex-shrink-0" size={14} />
                            <span className="text-truncate" style={{ maxWidth: '220px' }} title={item.fileName}>
                              {item.fileName || 'ATS-Resume.pdf'}
                            </span>
                          </span>
                        </td>

                        {/* Target Job */}
                        <td className="fw-medium text-dark">{item.targetJob || 'Target Job'}</td>

                        {/* Company */}
                        <td className="text-secondary">{item.company || '—'}</td>

                        {/* ATS Score (80-100 green, 50-79 yellow/orange, 0-49 red) */}
                        <td>
                          <span className={`badge rounded-pill px-2.5 py-1.5 fw-bold ${scoreBadgeClass(item.atsScore)}`}>
                            {item.atsScore}/100
                          </span>
                        </td>

                        {/* Projected Score (Blue info badge or —) */}
                        <td>
                          {item.projectedScore !== null && item.projectedScore !== undefined ? (
                            <span className="badge rounded-pill bg-info-subtle text-info fw-bold px-2.5 py-1.5">
                              {item.projectedScore}/100
                            </span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>

                        {/* Analyzed Date */}
                        <td className="small text-secondary">{analyzedDate}</td>

                        {/* ATS Status */}
                        <td>
                          <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-20 d-inline-flex align-items-center gap-1 fw-semibold">
                            <FaCheckCircle size={10} /> Parsed
                          </span>
                        </td>

                        {/* Actions: View & PDF buttons */}
                        <td className="text-end pe-4">
                          <div className="d-inline-flex align-items-center gap-1">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 rounded-2"
                              onClick={() => setSelectedRecord(item)}
                              title="View Scan Details"
                            >
                              <FaEye size={12} /> View
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1 rounded-2"
                              onClick={() => handleDownloadResume(item._id, item.fileName)}
                              disabled={openingResume === item._id}
                              title="Open/Download Resume PDF"
                            >
                              <FaFilePdf size={12} /> PDF
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* 5. PAGINATION FOOTER */}
          {!loading && !error && totalRecords > 0 && (
            <div className="p-3 bg-light border-top d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div className="text-muted small">
                Showing <strong className="text-dark">{startIndex + 1}</strong> to{' '}
                <strong className="text-dark">{endIndex}</strong> of <strong className="text-dark">{totalRecords}</strong> entries
              </div>

              <div className="d-flex align-items-center gap-1">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary px-3"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    className={`btn btn-sm px-3 ${
                      currentPage === pageNum ? 'btn-primary fw-bold' : 'btn-outline-secondary'
                    }`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary px-3"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* DETAILS VIEW MODAL */}
      {selectedRecord && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title fw-bold">ATS Resume Scan Details</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedRecord(null)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <span className="text-muted small d-block">Student Name</span>
                  <strong className="fs-6 text-dark">{selectedRecord.studentName}</strong>
                </div>
                <div className="mb-3">
                  <span className="text-muted small d-block">Student ID</span>
                  <span className="badge bg-secondary-subtle text-secondary font-monospace fw-bold">
                    {selectedRecord.studentId}
                  </span>
                </div>
                <div className="mb-3">
                  <span className="text-muted small d-block">File Name</span>
                  <span className="fw-bold text-primary">{selectedRecord.fileName}</span>
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <span className="text-muted small d-block">Target Job</span>
                    <strong className="text-dark">{selectedRecord.targetJob}</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted small d-block">Company</span>
                    <strong className="text-dark">{selectedRecord.company}</strong>
                  </div>
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <span className="text-muted small d-block">ATS Score</span>
                    <span className={`badge rounded-pill fs-6 px-3 py-1 ${scoreBadgeClass(selectedRecord.atsScore)}`}>
                      {selectedRecord.atsScore}/100
                    </span>
                  </div>
                  <div className="col-6">
                    <span className="text-muted small d-block">Projected Score</span>
                    {selectedRecord.projectedScore !== null && selectedRecord.projectedScore !== undefined ? (
                      <span className="badge rounded-pill bg-info-subtle text-info fs-6 px-3 py-1 fw-bold">
                        {selectedRecord.projectedScore}/100
                      </span>
                    ) : (
                      <span className="text-muted fs-6">—</span>
                    )}
                  </div>
                </div>
                <div className="row g-3">
                  <div className="col-6">
                    <span className="text-muted small d-block">Analyzed Date</span>
                    <span className="text-dark">
                      {selectedRecord.analyzedAt
                        ? new Date(selectedRecord.analyzedAt).toLocaleString()
                        : '—'}
                    </span>
                  </div>
                  <div className="col-6">
                    <span className="text-muted small d-block">ATS Status</span>
                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-20 fw-bold">
                      Parsed
                    </span>
                  </div>
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button
                  className="btn btn-primary btn-sm px-3"
                  onClick={() => handleDownloadResume(selectedRecord._id, selectedRecord.fileName)}
                >
                  <FaFilePdf size={12} className="me-1" /> View/Download PDF
                </button>
                <button className="btn btn-secondary btn-sm px-3" onClick={() => setSelectedRecord(null)}>
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
