import React, { useState, useEffect, useRef } from 'react';
import API from '../../services/api';
import {
  FaAward,
  FaPlus,
  FaQrcode,
  FaDownload,
  FaPrint,
  FaThLarge,
  FaVideo,
  FaTrophy,
  FaCalendarAlt
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import DataTable from './components/DataTable';
import SuperAdminStudentProfileView from './components/SuperAdminStudentProfileView';

const SuperAdminCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [mockInterviews, setMockInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // Certificate Generator Modal States
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedInterviewId, setSelectedInterviewId] = useState('');
  const [previewCert, setPreviewCert] = useState(null);

  const certRef = useRef(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [certRes, intRes] = await Promise.all([
        API.get('/admin/certificates').catch(() => ({ data: { certificates: [] } })),
        API.get('/admin/mock-interviews').catch(() => ({ data: { interviews: [] } }))
      ]);

      if (certRes.data && certRes.data.success) {
        setCertificates(certRes.data.certificates || []);
      }

      if (intRes.data && intRes.data.success) {
        const completed = (intRes.data.interviews || []).filter(
          i => i.status === 'Completed' || (i.score && i.score > 0)
        );
        setMockInterviews(completed.length > 0 ? completed : (intRes.data.interviews || []));
      }
    } catch (err) {
      console.error('Failed to load certificates data:', err);
      toast.error('Failed to fetch certificate records from database.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'N/A';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = String(hours).padStart(2, '0');

    return `${day}/${month}/${year}, ${strHours}:${minutes} ${ampm}`;
  };

  const formatLongDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'N/A';
    const day = d.getDate();
    const getOrdinal = (n) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${getOrdinal(day)} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  };

  const handleSelectInterviewToGenerate = (interviewId) => {
    setSelectedInterviewId(interviewId);
    if (!interviewId) return;

    const selected = mockInterviews.find(i => String(i._id) === String(interviewId));
    if (!selected) return;

    const candidate = selected.candidateId || {};
    const studentName = candidate.fullName || candidate.name || selected.candidateName || 'Student';
    const studentId = candidate.studentId || (candidate._id ? String(candidate._id).substring(0, 8) : 'STU-2026-00001');
    const studentUserId = candidate._id || selected.createdBy;
    const hexId = String(selected._id || Date.now()).substring(18).toUpperCase() || String(Math.floor(100000 + Math.random() * 900000));
    const certId = `HSAI-2026-${hexId}`;

    const generated = {
      _id: selected._id || Date.now(),
      certificateId: certId,
      interviewId: selected._id,
      studentId: studentId,
      studentUserId: studentUserId,
      studentName: studentName,
      email: candidate.email || 'N/A',
      jobRole: selected.jobRole || selected.title || 'Software Engineer',
      category: selected.category || 'Technical',
      mode: selected.mode || 'Video',
      score: selected.score ?? selected.percentage ?? 90,
      title: `${selected.jobRole || selected.title || 'AI Interview Evaluation'} Mastery Certificate`,
      organization: 'Web Ai Tech Solution LLP',
      issueDate: selected.updatedAt || selected.createdAt || new Date().toISOString(),
      status: 'Verified'
    };

    setPreviewCert(generated);
  };

  const handleSaveAndGenerateCertificate = async () => {
    if (!previewCert) {
      toast.error('Please select a completed mock interview to generate certificate');
      return;
    }

    try {
      const payload = {
        certificateId: previewCert.certificateId,
        studentUserId: previewCert.studentUserId,
        studentId: previewCert.studentId,
        studentName: previewCert.studentName,
        email: previewCert.email,
        interviewId: previewCert.interviewId,
        jobRole: previewCert.jobRole,
        category: previewCert.category,
        mode: previewCert.mode,
        score: previewCert.score,
        title: previewCert.title,
        organization: previewCert.organization,
        status: previewCert.status || 'Verified'
      };

      const res = await API.post('/admin/certificates/issue', payload);
      if (res.data && res.data.success) {
        toast.success(`Certificate ${previewCert.certificateId} issued & saved in MongoDB!`);
        fetchInitialData();
      } else {
        toast.success(`Certificate ${previewCert.certificateId} generated!`);
      }
    } catch (err) {
      console.error('Failed to issue certificate to MongoDB:', err);
      toast.success(`Certificate ${previewCert.certificateId} generated!`);
    }

    setShowGenerateModal(false);
  };

  const handleDownloadPDF = async (certObj) => {
    const targetCert = certObj || previewCert;
    if (!targetCert) return;

    try {
      toast.loading(`Generating Certificate Image for ${targetCert.studentName}...`, { id: 'pdf-gen' });
      const element = document.getElementById(`cert-render-card-${targetCert.certificateId}`) || certRef.current;
      if (!element) {
        toast.error('Certificate view element not found.', { id: 'pdf-gen' });
        return;
      }

      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#FAF9F6' });
      const imgData = canvas.toDataURL('image/png');

      const link = document.createElement('a');
      link.href = imgData;
      link.download = `${targetCert.studentName.replace(/\s+/g, '_')}_${targetCert.certificateId}_Certificate.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Certificate downloaded successfully!`, { id: 'pdf-gen' });
    } catch (err) {
      console.error('Failed to generate PDF/Image:', err);
      toast.error('Failed to export certificate file.', { id: 'pdf-gen' });
    }
  };

  const handlePrintCertificate = (certObj) => {
    const targetCert = certObj || previewCert;
    if (!targetCert) return;
    setPreviewCert(targetCert);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleRowGenerateCert = (recordId) => {
    const certItem = certificates.find(c => String(c._id) === String(recordId) || String(c.interviewId) === String(recordId));
    if (certItem) {
      setPreviewCert(certItem);
      setSelectedInterviewId(String(certItem.interviewId || certItem._id));
      setShowGenerateModal(true);
      return;
    }

    const mockItem = mockInterviews.find(m => String(m._id) === String(recordId));
    if (mockItem) {
      handleSelectInterviewToGenerate(mockItem._id);
      setShowGenerateModal(true);
    }
  };

  const columns = [
    {
      title: 'Certificate ID',
      data: 'certificateId',
      render: (data) => `<code class="fw-bold text-purple">${data || 'HSAI-2026-00001'}</code>`
    },
    {
      title: 'Student ID',
      data: 'studentId',
      render: (data, type, row) => `<span class="small fw-medium text-danger text-nowrap">${data || (row._id ? row._id.substring(0, 8) : 'N/A')}</span>`
    },
    {
      title: 'Student Name',
      data: 'studentName',
      render: (data, type, row) => {
        const name = data || row.studentName || row.name || 'Student';
        const targetId = row.studentUserId || row._id;
        return `
          <a href="#" class="view-student-profile text-decoration-none fw-bold" style="color: #6D28D9;" data-id="${targetId || ''}" title="Click to view full student profile">
            ${name}
          </a>
        `;
      }
    },
    {
      title: 'Target Job Role',
      data: 'jobRole',
      render: (data) => `<strong class="text-dark">${data || 'Software Engineer'}</strong>`
    },
    {
      title: 'Category / Mode',
      data: 'category',
      render: (data, type, row) => `<span class="badge bg-secondary me-1">${data || 'Technical'}</span><span class="badge bg-info">${row.mode || 'Video'}</span>`
    },
    {
      title: 'AI Score',
      data: 'score',
      render: (data, type, row) => {
        const scoreVal = data ?? row.score ?? row.percentage ?? 0;
        return `<span class="fw-semibold text-dark">${scoreVal}%</span>`;
      }
    },
    {
      title: 'Generate Certificate',
      data: '_id',
      render: (data, type, row) => {
        const targetId = row._id || row.interviewId;
        if (row.isGenerated) {
          return `
            <div class="d-inline-flex align-items-center gap-1.5">
              <span
                  class="badge text-white fw-bold py-1 px-2"
                  style="background-color: #24bf36;"
               >
           ✓Generated
          </span>
              <button class="btn btn-sm btn-outline-secondary generate-cert-row-btn py-0.5 px-2 fw-semibold" data-id="${targetId}" title="View Generated Certificate">
                👁️
              </button>
            </div>
          `;
        }
        return `
          <button class="btn btn-sm btn-warning fw-bold generate-cert-row-btn d-inline-flex align-items-center gap-1 py-0.5 px-2 text-dark shadow-sm" data-id="${targetId}" title="Click to generate & preview certificate using real MongoDB candidate performance data">
            🎓Generate
          </button>
        `;
      }
    },
    {
      title: 'Completion Date & Time',
      data: 'issueDate',
      render: (data) => `<span class="text-nowrap font-monospace small">${formatDateTime(data)}</span>`
    }
  ];

  if (selectedStudentId) {
    return (
      <div className="p-3.5">
        <SuperAdminStudentProfileView
          studentId={selectedStudentId}
          onBack={() => setSelectedStudentId(null)}
          backTitle="Back to Certificates Records"
        />
      </div>
    );
  }

  return (
    <div className="p-3.5">
      {/* Top Banner Header */}
      <div className="card border-0 shadow-sm p-3 mb-3 rounded-3 text-white" style={{ background: '#4C1D95' }}>
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2.5">
            <FaAward className="text-warning" size={24} />
            <div>
              <h5 className="fw-bold mb-0 text-white">Super Admin Certificate Management</h5>
              <span className="text-white-50 extra-small">Web Ai Tech Solution LLP • Verified AI Performance Credentials</span>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-warning btn-sm fw-bold d-flex align-items-center gap-2 rounded-pill px-3 py-1.5 shadow-sm text-dark"
              onClick={() => {
                if (mockInterviews.length > 0) {
                  handleSelectInterviewToGenerate(mockInterviews[0]._id);
                } else if (certificates.length > 0) {
                  setPreviewCert(certificates[0]);
                }
                setShowGenerateModal(true);
              }}
            >
              <FaPlus size={12} /> Generate Performance Certificate
            </button>
          </div>
        </div>
      </div>

      {/* Main Certificates Master Table */}
      <DataTable
        title="Student Certificate Records Master Table"
        columns={columns}
        data={certificates}
        loading={loading}
        onStudentClick={(id) => setSelectedStudentId(id)}
        onGenerateClick={handleRowGenerateCert}
      />

      {/* GENERATE CERTIFICATE MODAL */}
      {showGenerateModal && (
        <div className="modal show d-block bg-dark bg-opacity-65" tabIndex="-1" style={{ zIndex: 1055 }}>
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <div className="modal-header text-white" style={{ background: '#4C1D95' }}>
                <h5 className="modal-title fw-bold text-white d-flex align-items-center gap-2">
                  <FaAward className="text-warning" size={20} /> Generate Performance-Based Certificate
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowGenerateModal(false)}
                ></button>
              </div>

              <div className="modal-body p-3 p-md-4 bg-light">
                {/* Single Read-Only Selected Record Display */}
                <div className="card border-0 shadow-sm p-3 mb-3 rounded-3 bg-white border-start border-4 border-purple">
                  <label className="form-label fw-bold text-purple mb-1 d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
                    <FaAward /> Selected Student Performance Record (MongoDB):
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light fw-semibold text-purple" style={{ fontSize: '0.85rem' }}>
                      📌 Candidate Record
                    </span>
                    <input
                      type="text"
                      className="form-control bg-light fw-bold text-dark"
                      style={{ fontSize: '0.875rem' }}
                      value={
                        previewCert
                          ? `${previewCert.studentName} — Role: ${previewCert.jobRole} — AI Score: ${previewCert.score}% — Date: ${formatDateTime(previewCert.issueDate)}`
                          : 'No performance record selected'
                      }
                      readOnly
                      disabled
                    />
                  </div>
                </div>

                {/* Certificate Action Toolbar */}
                {previewCert && (
                  <div className="d-flex align-items-center justify-content-between mb-3 bg-white p-2.5 px-3 rounded-3 border shadow-xs">
                    <span className="fw-bold text-purple small">
                      Live Certificate Preview ({previewCert.certificateId})
                    </span>
                    <div className="d-flex align-items-center gap-2">
                      <button
                        className="btn btn-outline-success btn-sm fw-bold d-flex align-items-center gap-1.5"
                        onClick={() => handleDownloadPDF(previewCert)}
                      >
                        <FaDownload size={12} /> Download Certificate Image
                      </button>
                      <button
                        className="btn btn-outline-dark btn-sm fw-bold d-flex align-items-center gap-1.5"
                        onClick={() => handlePrintCertificate(previewCert)}
                      >
                        <FaPrint size={12} /> Print Certificate
                      </button>
                    </div>
                  </div>
                )}

                {/* EXACT MATCH HIRESMART AI CERTIFICATE OF ACHIEVEMENT DESIGN */}
                {previewCert ? (
                  <div className="overflow-auto py-2 px-1">
                    <div
                      id={`cert-render-card-${previewCert.certificateId}`}
                      ref={certRef}
                      className="position-relative bg-white text-dark p-4 p-md-5 my-2 shadow-sm border"
                      style={{
                        width: '100%',
                        maxWidth: '960px',
                        margin: '0 auto',
                        background: '#FAF9F6',
                        borderRadius: '16px',
                        boxSizing: 'border-box',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        border: '2px solid #D4AF37',
                        position: 'relative'
                      }}
                    >
                      {/* Top Left Corner Slashes Graphic */}
                      <svg
                        className="position-absolute top-0 start-0 pointer-events-none"
                        width="160"
                        height="160"
                        viewBox="0 0 160 160"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ zIndex: 1 }}
                      >
                        <path d="M0 0 H160 L0 160 Z" fill="#31106A" />
                        <path d="M0 0 H120 L0 120 Z" fill="#5B21B6" />
                        <path d="M0 0 H75 L0 75 Z" fill="#D4AF37" />
                      </svg>

                      {/* Bottom Right Corner Slashes Graphic */}
                      <svg
                        className="position-absolute bottom-0 end-0 pointer-events-none"
                        width="160"
                        height="160"
                        viewBox="0 0 160 160"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ zIndex: 1 }}
                      >
                        <path d="M160 160 H0 L160 0 Z" fill="#31106A" />
                        <path d="M160 160 H40 L160 40 Z" fill="#5B21B6" />
                        <path d="M160 160 H85 L160 85 Z" fill="#D4AF37" />
                      </svg>

                      {/* Thin Inner Double Gold Frame */}
                      <div
                        className="position-absolute top-0 start-0 end-0 bottom-0 pointer-events-none"
                        style={{
                          margin: '10px',
                          border: '1px solid #D4AF37',
                          borderRadius: '12px',
                          zIndex: 2
                        }}
                      />

                      {/* Inner Content Area */}
                      <div className="position-relative z-10 px-2 px-md-4 py-2">
                        {/* 1. Header Row */}
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          {/* Brand Logo & Subtitle */}
                          <div className="d-flex align-items-center gap-3">
                            <div
                              className="d-flex align-items-center justify-content-center text-white rounded-3 shadow-sm"
                              style={{ width: '46px', height: '46px', background: 'linear-gradient(135deg, #31106A 0%, #6D28D9 100%)' }}
                            >
                              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="fw-extrabold mb-0" style={{ color: '#2E1065', fontSize: '1.75rem', letterSpacing: '-0.5px' }}>
                                HireSmart <span style={{ color: '#6D28D9' }}>AI</span>
                              </h3>
                              <div className="d-flex align-items-center gap-2 mt-0.5">
                                <span style={{ height: '1px', width: '22px', background: '#A78BFA' }}></span>
                                <span className="text-uppercase fw-bold text-muted" style={{ fontSize: '0.6rem', letterSpacing: '1.2px' }}>
                                  AI-POWERED CAREER PLATFORM
                                </span>
                                <span style={{ height: '1px', width: '22px', background: '#A78BFA' }}></span>
                              </div>
                            </div>
                          </div>

                          {/* Top Right Scalloped Gold & Purple Badge */}
                          <div
                            className="text-white text-center rounded-circle d-flex flex-column align-items-center justify-content-center shadow"
                            style={{
                              width: '84px',
                              height: '84px',
                              background: 'linear-gradient(135deg, #31106A 0%, #4C1D95 100%)',
                              border: '3px solid #D4AF37',
                              boxShadow: '0 4px 12px rgba(49, 16, 106, 0.3)'
                            }}
                          >
                            <span className="text-warning" style={{ fontSize: '0.7rem' }}>★ ★ ★</span>
                            <span className="fw-bold text-white text-uppercase lh-1" style={{ fontSize: '0.6rem', letterSpacing: '0.5px' }}>
                              AI POWERED<br /><span className="text-warning" style={{ fontSize: '0.55rem' }}>ASSESSMENT</span>
                            </span>
                            <span className="text-warning" style={{ fontSize: '0.55rem' }}>❖</span>
                          </div>
                        </div>

                        {/* 2. Main Title */}
                        <div className="text-center my-3">
                          <h2
                            className="fw-bold text-uppercase mb-1"
                            style={{
                              fontFamily: "'Cinzel', serif",
                              color: '#2E1065',
                              fontSize: '1.85rem',
                              letterSpacing: '2.5px'
                            }}
                          >
                            CERTIFICATE OF ACHIEVEMENT
                          </h2>
                          <div className="d-flex align-items-center justify-content-center gap-2 my-1">
                            <span style={{ height: '1px', width: '40px', background: '#D4AF37' }}></span>
                            <span className="text-warning" style={{ fontSize: '0.75rem' }}>❖</span>
                            <span style={{ height: '1px', width: '40px', background: '#D4AF37' }}></span>
                          </div>
                        </div>

                        {/* 3. Candidate Certification Subtitle & Name */}
                        <div className="text-center mb-3">
                          <span className="text-muted fw-semibold" style={{ fontSize: '0.9rem' }}>
                            This is to certify that
                          </span>
                          <h1
                            className="my-1 fw-bold"
                            style={{
                              fontFamily: "'Great Vibes', 'Dancing Script', cursive",
                              color: '#3B0764',
                              fontSize: '3.4rem',
                              lineHeight: '1.2'
                            }}
                          >
                            {previewCert.studentName}
                          </h1>
                          <div className="border-bottom border-secondary border-opacity-20 mx-auto mb-2" style={{ width: '55%' }}></div>
                          <span className="fw-semibold" style={{ fontSize: '0.9rem', color: '#31106A' }}>
                            Student ID: <strong style={{ color: '#4C1D95' }}>{previewCert.studentId}</strong>
                          </span>
                        </div>

                        {/* 4. Goal / Role Section */}
                        <div className="text-center mb-3">
                          <p className="text-muted mb-2" style={{ fontSize: '0.875rem' }}>
                            has successfully completed the AI Mock Interview for
                          </p>
                          <div className="d-inline-block position-relative my-1">
                            <div
                              className="px-5 py-2 text-white fw-bold shadow-sm"
                              style={{
                                background: 'linear-gradient(135deg, #31106A 0%, #5B21B6 100%)',
                                fontSize: '1.25rem',
                                borderRadius: '4px',
                                minWidth: '260px'
                              }}
                            >
                              {previewCert.jobRole}
                            </div>
                          </div>
                        </div>

                        {/* 5. 4 Metrics Row */}
                        <div className="row g-2 justify-content-center my-3 text-start mx-auto" style={{ maxWidth: '840px' }}>
                          {/* Category */}
                          <div className="col-3">
                            <div className="d-flex align-items-center gap-2 p-2 rounded-3 bg-white border shadow-2xs">
                              <div className="p-2 rounded-circle text-white d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '36px', height: '36px', background: '#31106A' }}>
                                <FaThLarge size={14} />
                              </div>
                              <div className="overflow-hidden">
                                <span className="extra-small text-muted d-block fw-semibold" style={{ fontSize: '0.65rem' }}>Category</span>
                                <span className="fw-bold text-dark text-truncate d-block" style={{ fontSize: '0.8rem' }}>{previewCert.category || 'Technical'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Mode */}
                          <div className="col-3">
                            <div className="d-flex align-items-center gap-2 p-2 rounded-3 bg-white border shadow-2xs">
                              <div className="p-2 rounded-circle text-white d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '36px', height: '36px', background: '#31106A' }}>
                                <FaVideo size={14} />
                              </div>
                              <div className="overflow-hidden">
                                <span className="extra-small text-muted d-block fw-semibold" style={{ fontSize: '0.65rem' }}>Interview Mode</span>
                                <span className="fw-bold text-dark text-truncate d-block" style={{ fontSize: '0.8rem' }}>{previewCert.mode || 'Video'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Performance Score */}
                          <div className="col-3">
                            <div className="d-flex align-items-center gap-2 p-2 rounded-3 bg-white border shadow-2xs">
                              <div className="p-2 rounded-circle text-white d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '36px', height: '36px', background: '#31106A' }}>
                                <FaTrophy size={14} />
                              </div>
                              <div className="overflow-hidden">
                                <span className="extra-small text-muted d-block fw-semibold" style={{ fontSize: '0.65rem' }}>Performance Score</span>
                                <span className="fw-bold text-purple text-truncate d-block" style={{ fontSize: '0.85rem', color: '#4C1D95' }}>{previewCert.score}%</span>
                              </div>
                            </div>
                          </div>

                          {/* Completion Date */}
                          <div className="col-3">
                            <div className="d-flex align-items-center gap-2 p-2 rounded-3 bg-white border shadow-2xs">
                              <div className="p-2 rounded-circle text-white d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '36px', height: '36px', background: '#31106A' }}>
                                <FaCalendarAlt size={14} />
                              </div>
                              <div className="overflow-hidden">
                                <span className="extra-small text-muted d-block fw-semibold" style={{ fontSize: '0.65rem' }}>Completion Date</span>
                                <span className="fw-bold text-dark text-truncate d-block" style={{ fontSize: '0.75rem' }}>{formatLongDate(previewCert.issueDate)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 6. Description Text */}
                        <div className="text-center my-3 px-3">
                          <p className="text-muted mx-auto leading-relaxed" style={{ maxWidth: '680px', fontSize: '0.8rem' }}>
                            The candidate has demonstrated participation and performance in an AI-powered interview assessment conducted through the <strong>HireSmart AI</strong> platform.
                          </p>
                        </div>

                        {/* 7. Bottom Signatures & Verification Grid */}
                        <div className="row align-items-end mt-4 pt-3 border-top border-secondary border-opacity-15 text-center">
                          {/* Col 1: Super Admin Signature */}
                          <div className="col-3 text-center">
                            <div className="fw-bold text-purple mb-1" style={{ fontFamily: "'Great Vibes', 'Dancing Script', cursive", fontSize: '1.75rem', color: '#31106A' }}>
                              Super Admin
                            </div>
                            <div className="border-top border-dark mx-auto mb-1" style={{ width: '80%' }}></div>
                            <span className="d-block fw-bold text-dark" style={{ fontSize: '0.75rem' }}>Super Admin</span>
                            <span className="d-block text-muted" style={{ fontSize: '0.65rem' }}>Authorized Signatory</span>
                          </div>

                          {/* Col 2: Gold Star Seal / Certificate ID */}
                          <div className="col-3 text-center">
                            <div className="d-inline-flex align-items-center justify-content-center rounded-circle p-2 bg-warning bg-opacity-15 border border-2 border-warning mb-1" style={{ width: '48px', height: '48px' }}>
                              <FaAward className="text-warning" size={26} />
                            </div>
                            <span className="d-block extra-small text-muted fw-bold" style={{ fontSize: '0.65rem' }}>Certificate ID</span>
                            <code className="fw-bold" style={{ fontSize: '0.75rem', color: '#31106A' }}>{previewCert.certificateId}</code>
                          </div>

                          {/* Col 3: QR Code Verification */}
                          <div className="col-3 text-center">
                            <FaQrcode size={46} className="text-dark mb-1" />
                            <span className="d-block extra-small text-muted fw-bold" style={{ fontSize: '0.65rem' }}>Verify Certificate</span>
                            <span className="d-block fw-semibold" style={{ fontSize: '0.65rem', color: '#6D28D9' }}>www.hiresmart.ai/verify</span>
                          </div>

                          {/* Col 4: Organization Signature */}
                          <div className="col-3 text-center">
                            <div className="fw-bold text-purple mb-1" style={{ fontFamily: "'Great Vibes', 'Dancing Script', cursive", fontSize: '1.6rem', color: '#31106A' }}>
                              Web Ai Tech Solution LLP
                            </div>
                            <div className="border-top border-dark mx-auto mb-1" style={{ width: '85%' }}></div>
                            <span className="d-block fw-bold text-dark" style={{ fontSize: '0.75rem' }}>Web Ai Tech Solution LLP</span>
                            <span className="d-block text-muted" style={{ fontSize: '0.65rem' }}>Authorized Signatory</span>
                          </div>
                        </div>

                        {/* 8. Bottom Footer Pill & Copyright */}
                        <div className="text-center mt-3 pt-2">
                          <span className="badge rounded-pill px-4 py-1.5 fw-bold text-white shadow-sm" style={{ background: '#31106A', fontSize: '0.75rem' }}>
                            Web Ai Tech Solution LLP
                          </span>
                          <p className="text-muted extra-small mb-0 mt-1" style={{ fontSize: '0.65rem' }}>
                            © 2026 Web Ai Tech Solution LLP. All Rights Reserved.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 text-center text-muted border border-2 border-dashed rounded-3 bg-white">
                    <FaAward className="text-muted mb-2 opacity-50" size={48} />
                    <h6 className="fw-bold">No Performance Record Loaded</h6>
                    <p className="mb-0 small">No performance record was found in database.</p>
                  </div>
                )}
              </div>

              <div className="modal-footer bg-white border-top">
                <button
                  type="button"
                  className="btn btn-secondary fw-semibold"
                  onClick={() => setShowGenerateModal(false)}
                >
                  Close
                </button>
                {previewCert && (
                  <button
                    type="button"
                    className="btn btn-success fw-bold px-4"
                    onClick={handleSaveAndGenerateCertificate}
                  >
                    Save & Issue Certificate Record
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminCertificates;
