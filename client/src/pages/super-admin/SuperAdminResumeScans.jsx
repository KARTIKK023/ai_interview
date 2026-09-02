import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { FaFileAlt, FaArrowLeft, FaSearch, FaCheckCircle, FaFilePdf } from 'react-icons/fa';
import toast from 'react-hot-toast';

const SuperAdminResumeScans = () => {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/resume-scans');
      if (res.data && res.data.success) {
        setResumes(res.data.resumes || []);
      }
    } catch (err) {
      console.error('Failed to load resume scans:', err);
      toast.error('Failed to fetch ATS resume scans from server.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = resumes.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (r.name || r.student_name || '').toLowerCase().includes(q) ||
           (r.fileName || '').toLowerCase().includes(q) ||
           (r.studentId || '').toLowerCase().includes(q);
  });

  return (
    <div className="min-vh-100 bg-light d-flex flex-column" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header
        className="px-4 py-3 text-white d-flex align-items-center justify-content-between shadow-sm"
        style={{ background: 'linear-gradient(90deg, #09071B 0%, #110D33 50%, #171242 100%)' }}
      >
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-outline-light btn-sm d-flex align-items-center gap-1" onClick={() => navigate('/super-admin/dashboard')}>
            <FaArrowLeft size={12} /> Dashboard
          </button>
          <div className="d-flex align-items-center gap-2">
            <FaFileAlt className="text-warning" size={20} />
            <h5 className="fw-bold mb-0">ATS Resume Scans & Uploads ({resumes.length})</h5>
          </div>
        </div>
      </header>

      <main className="container-fluid p-4 flex-grow-1">
        <div className="card border-0 shadow-sm p-3 mb-4 rounded-3">
          <div className="row align-items-center g-3">
            <div className="col-md-6">
              <div className="position-relative">
                <FaSearch className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" size={14} />
                <input
                  type="text"
                  className="form-control ps-5"
                  placeholder="Search student name, file name, student ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6 text-md-end text-muted small">
              Total {resumes.length} resume document(s) uploaded & parsed by ATS Engine
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
          {loading ? (
            <div className="p-5 text-center text-muted">
              <div className="spinner-border text-warning mb-2" role="status"></div>
              <p className="mb-0">Loading ATS resume scans and documents...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-5 text-center text-muted">
              <p className="mb-0">No resume scan records found.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>Student Name</th>
                    <th>Student ID</th>
                    <th>File Name</th>
                    <th>Format</th>
                    <th>Upload Date</th>
                    <th>ATS Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r._id}>
                      <td className="fw-bold">{r.name || r.student_name || 'Student'}</td>
                      <td><code>{r.studentId || r.student_id || r._id.substring(0, 8)}</code></td>
                      <td>
                        <span className="d-flex align-items-center gap-1.5">
                          <FaFilePdf className="text-danger" size={14} />
                          {r.fileName || 'Resume.pdf'}
                        </span>
                      </td>
                      <td><span className="badge bg-secondary">{r.contentType || 'application/pdf'}</span></td>
                      <td className="small text-muted">{new Date(r.createdAt || r.uploadedAt).toLocaleDateString()}</td>
                      <td>
                        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-20 d-inline-flex align-items-center gap-1">
                          <FaCheckCircle size={10} /> ATS Parsed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SuperAdminResumeScans;
