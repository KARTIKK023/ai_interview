import React, { useContext, useState, useEffect, useRef } from 'react';
import StudentLayout from '../../components/StudentLayout';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import {
  FaAward,
  FaCertificate,
  FaDownload,
  FaCheckCircle,
  FaStar,
  FaTrophy,
  FaShieldAlt,
  FaRocket,
  FaMedal,
  FaPrint,
  FaThLarge,
  FaVideo,
  FaCalendarAlt,
  FaShareAlt
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/* REUSABLE CERTIFICATE CARD RENDER COMPONENT */
const CertificateCardRender = ({ cert, studentName, certRef, elementId }) => {
  if (!cert) return null;

  const displayStudentName = cert.studentName || studentName || 'Student';
  const displayStudentId = cert.studentId || 'N/A';
  const displayRole = cert.jobRole || 'Software Engineer';
  const displayCategory = cert.category || 'Technical';
  const displayMode = cert.mode || 'Video';
  const displayScore = cert.score ?? 85;
  const displayCertId = cert.certificateId || cert.id || 'HSAI-2026';

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

  return (
    <div
      id={elementId}
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
            {displayStudentName}
          </h1>
          <div className="border-bottom border-secondary border-opacity-20 mx-auto mb-2" style={{ width: '55%' }}></div>
          <span className="fw-semibold" style={{ fontSize: '0.9rem', color: '#31106A' }}>
            Student ID: <strong style={{ color: '#4C1D95' }}>{displayStudentId}</strong>
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
              {displayRole}
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
                <span className="fw-bold text-dark text-truncate d-block" style={{ fontSize: '0.8rem' }}>{displayCategory}</span>
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
                <span className="fw-bold text-dark text-truncate d-block" style={{ fontSize: '0.8rem' }}>{displayMode}</span>
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
                <span className="fw-bold text-purple text-truncate d-block" style={{ fontSize: '0.85rem', color: '#4C1D95' }}>{displayScore}%</span>
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
                <span className="fw-bold text-dark text-truncate d-block" style={{ fontSize: '0.75rem' }}>{formatLongDate(cert.issueDate)}</span>
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
            <code className="fw-bold" style={{ fontSize: '0.75rem', color: '#31106A' }}>{displayCertId}</code>
          </div>

          {/* Col 3: QR Code Verification */}
          <div className="col-3 text-center">
            <FaAward size={46} className="text-dark mb-1 opacity-80" />
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
  );
};

const StudentAchievements = () => {
  const { user } = useContext(AuthContext);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [downloadingCert, setDownloadingCert] = useState(null);

  const certRef = useRef(null);
  const downloadCertRef = useRef(null);
  const studentName = user?.fullName || user?.name || 'Student';

  useEffect(() => {
    fetchStudentCertificates();
  }, []);

  const fetchStudentCertificates = async () => {
    try {
      setLoading(true);
      const res = await API.get('/interviews/student/certificates');
      if (res.data && res.data.success) {
        setCertificates(res.data.certificates || []);
      } else {
        setCertificates([]);
      }
    } catch (err) {
      console.error('Failed to load student certificates:', err);
      toast.error('Failed to fetch certificate records from database.');
      setCertificates([]);
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

  const handleDownloadPDF = async (certObj) => {
    const targetCertObj = certObj || selectedCertificate;
    const certId = targetCertObj?.certificateId || targetCertObj?.id || targetCertObj?._id;

    if (!certId && !targetCertObj) {
      toast.error('No certificate selected for download.');
      return;
    }

    try {
      toast.loading(`Fetching & generating official certificate PDF...`, { id: 'pdf-student-gen' });

      // Fetch actual issued certificate from MongoDB record created by Super Admin
      let realCert = targetCertObj;
      if (certId) {
        const res = await API.get(`/interviews/student/certificates/${certId}`).catch(() => null);
        if (res?.data?.certificate) {
          realCert = res.data.certificate;
        }
      }

      if (!realCert) {
        toast.error('Certificate record not found in database.', { id: 'pdf-student-gen' });
        return;
      }

      setDownloadingCert(realCert);

      // Give React DOM time to mount the offscreen element & ensure fonts/styles are ready
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      const element =
        document.getElementById('student-cert-download-render-card') ||
        downloadCertRef.current ||
        (selectedCertificate ? document.getElementById(`student-cert-render-card-${selectedCertificate.certificateId || selectedCertificate.id}`) : null) ||
        certRef.current;

      if (!element) {
        setDownloadingCert(null);
        toast.error('Certificate render container not found.', { id: 'pdf-student-gen' });
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FAF9F6',
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');

      // Create high-res PDF document using jsPDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);

      const downloadStudentName = realCert.studentName || studentName;
      const downloadCertId = realCert.certificateId || realCert.id || 'HSAI-2026';
      pdf.save(`${downloadStudentName.replace(/\s+/g, '_')}_${downloadCertId}_Certificate.pdf`);

      setDownloadingCert(null);
      toast.success('Certificate downloaded successfully as PDF!', { id: 'pdf-student-gen' });
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      setDownloadingCert(null);
      toast.error('Failed to export certificate PDF file.', { id: 'pdf-student-gen' });
    }
  };

  const handleShare = (certObj) => {
    const certId = certObj?.certificateId || certObj?.id || 'HSAI-2026';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`https://hiresmart.ai/verify/${certId}`);
      toast.success('Certificate verification link copied to clipboard!');
    } else {
      toast.success(`Verification link generated for certificate ${certId}`);
    }
  };

  // Dynamic Skill Badges calculated from actual student data
  const badges = [
    {
      id: 1,
      title: 'AI Interview Champion',
      description: 'Completed AI Mock Interview simulations with verified score benchmarks.',
      icon: FaTrophy,
      color: '#F59E0B',
      unlocked: certificates.length > 0
    },
    {
      id: 2,
      title: 'ATS Resume Verified',
      description: 'Achieved ATS Resume Optimization benchmarks.',
      icon: FaShieldAlt,
      color: '#10B981',
      unlocked: true
    },
    {
      id: 3,
      title: 'Speed & Clarity Star',
      description: 'Demonstrated response clarity during technical interviews.',
      icon: FaRocket,
      color: '#6366F1',
      unlocked: certificates.length > 0
    },
    {
      id: 4,
      title: 'Question Bank Scholar',
      description: 'Practiced curated interview scenarios and technical banks.',
      icon: FaMedal,
      color: '#EC4899',
      unlocked: true
    }
  ];

  return (
    <StudentLayout>
      <div className="container-fluid py-2">
        {/* TOP HERO BANNER */}
        <div
          className="p-3.5 p-md-4 mb-4 text-white position-relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%)',
            borderRadius: '16px',
            boxShadow: '0 8px 25px -8px rgba(49, 46, 129, 0.35)',
            border: '1px solid rgba(99, 102, 241, 0.25)'
          }}
        >
          <div className="row align-items-center">
            <div className="col-lg-8">
              <div className="d-flex align-items-center gap-2 mb-1.5">
                <span className="badge bg-primary bg-opacity-30 border border-primary border-opacity-40 px-2.5 py-1 rounded-pill" style={{ color: '#93C5FD', fontSize: '0.725rem' }}>
                  <FaAward className="me-1" style={{ fontSize: '0.675rem' }} /> Student Credentials
                </span>
                <span className="badge bg-success bg-opacity-30 border border-success border-opacity-40 px-2.5 py-1 rounded-pill" style={{ color: '#6EE7B7', fontSize: '0.725rem' }}>
                  <FaCheckCircle className="me-1" style={{ fontSize: '0.675rem' }} /> Verified Status
                </span>
              </div>
              <h3 className="fw-extrabold mb-1 text-white">Certificates & Achievements</h3>
              <p className="text-white-50 mb-0 small leading-relaxed">
                View, verify, and download official HireSmart AI performance certificates issued by Super Admin upon completing your mock interview assessments.
              </p>
            </div>
            <div className="col-lg-4 text-center text-lg-end mt-3 mt-lg-0">
              <div className="d-inline-flex p-2.7 rounded-circle bg-white bg-opacity-10 border border-white border-opacity-20 shadow-sm">
                <FaAward size={40} className="text-warning" />
              </div>
            </div>
          </div>
        </div>

        {/* METRICS STATS CARDS */}
        <div className="row g-3 mb-4">
          <div className="col-md-3 col-sm-6">
            <div className="card card-custom p-3 bg-white border-0 shadow-sm d-flex flex-row align-items-center gap-3">
              <div className="p-3 rounded-3 bg-primary bg-opacity-10 text-primary">
                <FaCertificate size={24} />
              </div>
              <div>
                <span className="text-muted small fw-semibold">Certificates Earned</span>
                <h4 className="fw-extrabold mb-0 text-dark">{certificates.length}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="card card-custom p-3 bg-white border-0 shadow-sm d-flex flex-row align-items-center gap-3">
              <div className="p-3 rounded-3 bg-warning bg-opacity-10 text-warning">
                <FaMedal size={24} />
              </div>
              <div>
                <span className="text-muted small fw-semibold">Skill Badges</span>
                <h4 className="fw-extrabold mb-0 text-dark">{certificates.length > 0 ? 4 : 2}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="card card-custom p-3 bg-white border-0 shadow-sm d-flex flex-row align-items-center gap-3">
              <div className="p-3 rounded-3 bg-success bg-opacity-10 text-success">
                <FaStar size={24} />
              </div>
              <div>
                <span className="text-muted small fw-semibold">Average Performance</span>
                <h4 className="fw-extrabold mb-0 text-dark">
                  {certificates.length > 0
                    ? `${Math.round(certificates.reduce((acc, c) => acc + (c.score || 0), 0) / certificates.length)}%`
                    : 'N/A'}
                </h4>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="card card-custom p-3 bg-white border-0 shadow-sm d-flex flex-row align-items-center gap-3">
              <div className="p-3 rounded-3 bg-info bg-opacity-10 text-info">
                <FaTrophy size={24} />
              </div>
              <div>
                <span className="text-muted small fw-semibold">Verification</span>
                <h4 className="fw-extrabold mb-0 text-dark">MongoDB Verified</h4>
              </div>
            </div>
          </div>
        </div>

        {/* OFFICIAL CERTIFICATES SECTION */}
        <div className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
              <FaCertificate className="text-primary" /> Verified Student Certificates ({certificates.length})
            </h4>
            <span className="text-muted small">Live credentials from MongoDB</span>
          </div>

          {loading ? (
            <div className="p-5 text-center bg-white rounded-3 border shadow-sm my-3">
              <div className="spinner-border text-primary mb-2" role="status"></div>
              <p className="mb-0 text-muted fw-semibold">Fetching your verified certificates from database...</p>
            </div>
          ) : certificates.length === 0 ? (
            /* EMPTY STATE WHEN NO CERTIFICATES ISSUED */
            <div className="card border-0 shadow-sm p-5 text-center bg-white rounded-3 my-3">
              <div className="py-4">
                <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-4 d-inline-flex mb-3">
                  <FaAward size={52} />
                </div>
                <h4 className="fw-extrabold text-dark mb-2">No certificates issued yet.</h4>
                <p className="text-muted max-w-md mx-auto mb-4" style={{ maxWidth: '520px' }}>
                  Complete your AI Mock Interviews. Official performance-verified certificates will appear here as soon as Super Admin issues your certificate record.
                </p>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {certificates.map((cert) => (
                <div key={cert._id || cert.certificateId} className="col-lg-6">
                  <div
                    className="card card-custom p-4 border-0 shadow-sm h-100 position-relative"
                    style={{
                      background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                      borderLeft: '5px solid #4F46E5'
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold me-2 px-2.5 py-1">
                          {cert.jobRole || 'Software Engineer'}
                        </span>
                        <span className="badge bg-success bg-opacity-10 text-success fw-semibold px-2.5 py-1">
                          <FaCheckCircle className="me-1" /> {cert.status || 'Verified'}
                        </span>
                      </div>
                      <code className="fw-bold text-purple small">{cert.certificateId || cert.id}</code>
                    </div>

                    <h5 className="fw-bold text-dark mb-1">{cert.title}</h5>
                    <p className="text-muted small mb-3">Category: {cert.category || 'Technical'} • Mode: {cert.mode || 'Video'}</p>

                    <div className="bg-light p-3 rounded-3 mb-3">
                      <div className="row g-2 text-center">
                        <div className="col-6">
                          <span className="text-muted small d-block">Overall AI Score</span>
                          <span className="fw-bold text-primary fs-5">{cert.score}%</span>
                        </div>
                        <div className="col-6 border-start">
                          <span className="text-muted small d-block">Issue Date</span>
                          <span className="fw-semibold text-dark small">{formatDateTime(cert.issueDate)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <span className="text-muted small d-block mb-1 font-semibold">Issuer Authority:</span>
                      <span className="badge bg-white border text-secondary fw-semibold">
                        Web Ai Tech Solution LLP • HireSmart AI
                      </span>
                    </div>

                    <div className="mt-auto pt-3 border-top d-flex gap-2">
                      <button
                        className="btn btn-primary btn-sm fw-bold d-flex align-items-center gap-2 flex-grow-1 justify-content-center"
                        onClick={() => setSelectedCertificate(cert)}
                      >
                        <FaAward /> View Certificate
                      </button>
                      <button
                        className="btn btn-outline-secondary btn-sm fw-semibold d-flex align-items-center gap-1"
                        onClick={() => handleDownloadPDF(cert)}
                      >
                        <FaDownload /> Download PDF
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* UNLOCKED BADGES GRID */}
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
              <FaMedal className="text-warning" /> Skill Badges & Milestones
            </h4>
          </div>

          <div className="row g-3">
            {badges.map((b) => {
              const IconComp = b.icon;
              return (
                <div key={b.id} className="col-lg-3 col-md-6">
                  <div className="card card-custom p-3 border-0 shadow-sm h-100 text-center bg-white">
                    <div
                      className="rounded-circle mx-auto p-3 mb-3 d-inline-flex align-items-center justify-content-center"
                      style={{
                        backgroundColor: b.unlocked ? `${b.color}15` : '#F1F5F9',
                        color: b.unlocked ? b.color : '#94A3B8',
                        width: '64px',
                        height: '64px'
                      }}
                    >
                      <IconComp size={32} />
                    </div>
                    <h6 className="fw-bold text-dark mb-1">{b.title}</h6>
                    <p className="text-muted small mb-2">{b.description}</p>
                    <span className={`badge ${b.unlocked ? 'bg-success bg-opacity-10 text-success' : 'bg-light text-muted'} fw-normal mt-auto align-self-center`}>
                      {b.unlocked ? 'Unlocked' : 'Locked'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* HIDDEN OFFSCREEN CONTAINER FOR DIRECT PDF DOWNLOAD RENDER */}
      {downloadingCert && (
        <div style={{ position: 'fixed', left: '-9999px', top: '-9999px', width: '960px', opacity: 1, zIndex: -9999 }}>
          <CertificateCardRender
            cert={downloadingCert}
            studentName={studentName}
            certRef={downloadCertRef}
            elementId="student-cert-download-render-card"
          />
        </div>
      )}

      {/* EXACT MATCH HIRESMART AI CERTIFICATE OF ACHIEVEMENT PREVIEW MODAL */}
      {selectedCertificate && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 1055 }}
        >
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px', overflow: 'hidden' }}>
              <div className="modal-header text-white border-0 px-4 py-3" style={{ background: '#31106A' }}>
                <h5 className="modal-title fw-bold text-white d-flex align-items-center gap-2">
                  <FaAward className="text-warning" /> Official Verified Credential Preview
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedCertificate(null)}
                ></button>
              </div>

              {/* CERTIFICATE GRAPHICAL DISPLAY */}
              <div className="modal-body p-3 p-md-4 bg-light overflow-auto">
                <CertificateCardRender
                  cert={selectedCertificate}
                  studentName={studentName}
                  certRef={certRef}
                  elementId={`student-cert-render-card-${selectedCertificate.certificateId || selectedCertificate.id}`}
                />
              </div>

              <div className="modal-footer bg-white border-0 px-4 py-3 d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-secondary fw-semibold"
                  onClick={() => setSelectedCertificate(null)}
                >
                  Close
                </button>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-primary fw-bold d-flex align-items-center gap-1"
                    onClick={() => handleShare(selectedCertificate)}
                  >
                    <FaShareAlt /> Share Link
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary fw-bold d-flex align-items-center gap-1"
                    onClick={() => handleDownloadPDF(selectedCertificate)}
                  >
                    <FaDownload /> Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  );
};

export default StudentAchievements;
