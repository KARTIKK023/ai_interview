import React, { useState, useEffect } from 'react';
import API from '../../../services/api';
import {
  FaUserGraduate,
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaCheckCircle,
  FaGraduationCap,
  FaLink,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaExternalLinkAlt,
  FaExclamationTriangle,
  FaTags,
  FaBriefcase
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const SuperAdminStudentProfileView = ({ studentId, onBack, backTitle = 'Back to Records' }) => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (studentId) {
      fetchStudentProfile(studentId);
    }
  }, [studentId]);

  const fetchStudentProfile = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get(`/admin/students/${id}`);
      if (res.data && res.data.success && res.data.student) {
        setStudent(res.data.student);
      } else {
        setError('Student profile record not found in MongoDB');
        toast.error('Student profile not found');
      }
    } catch (err) {
      console.error('Failed to fetch student profile:', err);
      setError(err.response?.data?.message || 'Failed to connect to MongoDB server');
      toast.error('Failed to load profile from database');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mb-4">
        <div className="d-flex align-items-center justify-content-between bg-white p-3 rounded-3 shadow-sm border mb-3">
          <button className="btn btn-outline-secondary d-flex align-items-center gap-2 fw-semibold btn-sm" onClick={onBack}>
            <FaArrowLeft /> {backTitle}
          </button>
        </div>
        <div className="card border-0 shadow-sm p-5 text-center my-4 rounded-3">
          <div className="spinner-border text-purple mx-auto mb-3" role="status"></div>
          <h6 className="fw-bold text-dark mb-1">Fetching Student Profile from MongoDB...</h6>
          <p className="text-muted extra-small mb-0">Querying User collection by MongoDB User ID / Student ID</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="mb-4">
        <div className="d-flex align-items-center justify-content-between bg-white p-3 rounded-3 shadow-sm border mb-3">
          <button className="btn btn-outline-secondary d-flex align-items-center gap-2 fw-semibold btn-sm" onClick={onBack}>
            <FaArrowLeft /> {backTitle}
          </button>
        </div>
        <div className="card border-0 shadow-sm p-4 text-center my-4 rounded-3 bg-white">
          <FaExclamationTriangle className="text-warning mx-auto mb-2" size={32} />
          <h6 className="fw-bold text-dark mb-1">Profile Record Unavailable</h6>
          <p className="text-muted small mb-3">{error || 'The requested student record could not be loaded from MongoDB.'}</p>
          <button className="btn btn-purple btn-sm mx-auto fw-semibold" onClick={onBack}>
            Return to Master Table
          </button>
        </div>
      </div>
    );
  }

  const handleToggleServiceStatus = async () => {
    const rawStatus = (student?.serviceStatus || 'Active').toLowerCase();
    const isCurrentlyInactive = rawStatus.includes('inactive');
    const nextStatus = isCurrentlyInactive ? 'Active' : 'Services Inactive';

    try {
      toast.loading(`Updating service access in MongoDB...`, { id: 'profile-status-update' });
      const targetId = student._id || studentId;
      const res = await API.put(`/admin/students/${targetId}/service-status`, { serviceStatus: nextStatus });
      if (res.data && res.data.success) {
        toast.success(`HireSmart AI service access set to ${nextStatus}`, { id: 'profile-status-update' });
        setStudent(prev => ({ ...prev, serviceStatus: nextStatus }));
      }
    } catch (err) {
      console.error('Failed to update service status:', err);
      toast.error('Failed to update service status in database.', { id: 'profile-status-update' });
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

  // Real MongoDB Profile Data Extraction
  const fullName = student.fullName || student.name || 'Student';
  const email = student.email || 'Not provided';
  const mobile = student.mobileNumber || student.profile?.phone || student.phone || student.phoneNumber || 'Not provided';
  const sysStudentId = student.studentId || student.student_id || (student._id ? String(student._id) : 'N/A');
  const roleStr = (student.role || 'STUDENT').toUpperCase();
  const photoUrl = student.profilePhoto || student.profile?.profilePhoto || '';
  const dob = student.dateOfBirth || student.profile?.dateOfBirth || 'Not provided';
  const gender = student.gender || student.profile?.gender || 'Not specified';
  const location = student.location || student.profile?.location || 'Not specified';
  const bio = student.bio || student.profile?.bio || 'No professional bio provided.';
  const regDate = formatDateTime(student.createdAt);

  const rawServiceStatus = (student.serviceStatus || 'Active').toLowerCase();
  const isServiceInactive = rawServiceStatus.includes('inactive');
  const serviceStatusText = isServiceInactive ? 'Services Inactive' : 'Active';

  // Education Details from MongoDB
  const edu = student.education || student.profile?.education || {};
  const highestQual = edu.highestQualification || 'Not provided';
  const college = edu.collegeUniversity || edu.college || 'Not provided';
  const degree = edu.degree || 'Not provided';
  const spec = edu.specialization || 'Not provided';
  const gradYear = edu.graduationYear || 'Not provided';
  const cgpa = edu.cgpaPercentage || edu.cgpa || 'Not provided';

  // Professional Links from MongoDB
  const links = student.professionalLinks || student.profile?.professionalLinks || {};
  const linkedin = links.linkedin || student.profile?.linkedin || '';
  const portfolio = links.portfolio || student.profile?.portfolio || '';
  const otherLink = links.other || student.profile?.otherLink || '';

  // Optional arrays
  const skills = Array.isArray(student.profile?.skills) ? student.profile.skills : [];
  const targetRoles = Array.isArray(student.profile?.targetRoles) ? student.profile.targetRoles : [];

  return (
    <div className="student-profile-wrapper">
      {/* Top Header Navigation */}
      <div className="d-flex align-items-center justify-content-between bg-white p-3 rounded-3 shadow-sm border mb-3">
        <button
          className="btn btn-outline-secondary d-flex align-items-center gap-2 fw-semibold btn-sm"
          onClick={onBack}
        >
          <FaArrowLeft /> {backTitle}
        </button>
        <div className="d-flex align-items-center gap-2">
          <span className="badge rounded-pill px-3 py-1.5" style={{ background: '#4C1D95', color: '#FFFFFF', fontSize: '0.75rem' }}>
            Live MongoDB Sync•ID:{sysStudentId}
          </span>
        </div>
      </div>

      {/* Top Banner Header */}
      <div className="card border-0 shadow-sm p-3 mb-4 rounded-3 text-white" style={{ background: 'linear-gradient(135deg, #4C1D95 0%, #6D28D9 100%)' }}>
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-3">
            <div className="p-2 rounded-circle bg-white bg-opacity-20 text-white d-flex align-items-center justify-content-center" style={{ width: '44px', height: '44px' }}>
              <FaUserGraduate size={22} />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-white">{fullName}</h5>
              <span className="text-white-50 extra-small">{email}</span>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className={`btn btn-sm ${isServiceInactive ? 'btn-danger' : 'btn-success'} rounded-pill px-3 py-1 fw-bold extra-small shadow-sm d-flex align-items-center gap-1`}
              onClick={handleToggleServiceStatus}
              title="Click to toggle HireSmart AI service access in MongoDB"
            >
              <FaCheckCircle size={10} /> Service Access: {serviceStatusText}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Layout for Student Details */}
      <div className="row g-4 mb-4">
        {/* 1. STUDENT IDENTIFICATION CARD */}
        <div className="col-lg-4">
          <div className="card card-custom p-4 bg-white shadow-sm border-0 text-center h-100 rounded-3">
            <div className="position-relative d-inline-block mx-auto mb-3">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Profile Avatar"
                  className="rounded-circle border border-3 border-primary shadow-sm"
                  style={{ width: '110px', height: '110px', objectFit: 'cover' }}
                />
              ) : (
                <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-4 mx-auto d-inline-flex align-items-center justify-content-center" style={{ width: '110px', height: '110px' }}>
                  <FaUser size={52} />
                </div>
              )}
            </div>

            <h5 className="fw-bold mb-1">{fullName}</h5>
            <p className="text-muted small mb-3">{email}</p>

            <div className="p-3 bg-light rounded-3 border text-start mb-3">
              <label className="text-uppercase text-muted fw-bold extra-small d-block mb-1">
                System Student / User ID
              </label>
              <div className="d-flex align-items-center justify-content-between">
                <span className="font-monospace fw-bold fs-6 text-primary word-break-all">
                  {sysStudentId}
                </span>
                <span className="badge bg-secondary d-flex align-items-center gap-1 small flex-shrink-0">
                  <FaLock size={10} /> Locked
                </span>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center text-muted small px-2">
              <span>Account Role:</span>
              <span className="badge bg-primary text-uppercase">{roleStr}</span>
            </div>

            <div className="d-flex justify-content-between align-items-center text-muted small px-2 mt-2">
              <span>Registration Date:</span>
              <span className="fw-semibold text-dark">{regDate}</span>
            </div>
          </div>
        </div>

        {/* 2. PERSONAL INFORMATION */}
        <div className="col-lg-8">
          <div className="card card-custom p-4 bg-white shadow-sm border-0 h-100 rounded-3">
            <h5 className="fw-bold mb-3 text-primary d-flex align-items-center gap-2">
              <FaUser /> Personal Information
            </h5>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold small text-muted">Full Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted"><FaUser /></span>
                  <input type="text" className="form-control bg-light" value={fullName} readOnly disabled />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small text-muted">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted"><FaEnvelope /></span>
                  <input type="email" className="form-control bg-light" value={email} readOnly disabled />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small text-muted">Mobile Number</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted"><FaPhone /></span>
                  <input type="text" className="form-control bg-light" value={mobile} readOnly disabled />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small text-muted">Date of Birth</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted"><FaCalendarAlt /></span>
                  <input type="text" className="form-control bg-light" value={dob} readOnly disabled />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small text-muted">Gender</label>
                <input type="text" className="form-control bg-light" value={gender} readOnly disabled />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small text-muted">Location / City</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted"><FaMapMarkerAlt /></span>
                  <input type="text" className="form-control bg-light" value={location} readOnly disabled />
                </div>
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold small text-muted">About / Bio</label>
                <textarea className="form-control bg-light" rows={2} value={bio} readOnly disabled />
              </div>

              {/* Display skills or target roles if available */}
              {skills.length > 0 && (
                <div className="col-12">
                  <label className="form-label fw-semibold small text-muted d-flex align-items-center gap-1">
                    <FaTags size={12} /> Stored Candidate Skills
                  </label>
                  <div className="d-flex flex-wrap gap-1.5">
                    {skills.map((skill, idx) => (
                      <span key={idx} className="badge bg-purple bg-opacity-10 text-purple border border-purple border-opacity-20 px-2 py-1">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {targetRoles.length > 0 && (
                <div className="col-12">
                  <label className="form-label fw-semibold small text-muted d-flex align-items-center gap-1">
                    <FaBriefcase size={12} /> Stored Target Roles
                  </label>
                  <div className="d-flex flex-wrap gap-1.5">
                    {targetRoles.map((role, idx) => (
                      <span key={idx} className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-20 px-2 py-1">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. EDUCATION SECTION */}
        <div className="col-lg-6">
          <div className="card card-custom p-4 bg-white shadow-sm border-0 h-100 rounded-3">
            <h5 className="fw-bold mb-3 text-primary d-flex align-items-center gap-2">
              <FaGraduationCap /> Education Details
            </h5>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold small text-muted">Highest Qualification</label>
                <input type="text" className="form-control bg-light" value={highestQual} readOnly disabled />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small text-muted">College / University</label>
                <input type="text" className="form-control bg-light" value={college} readOnly disabled />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small text-muted">Degree</label>
                <input type="text" className="form-control bg-light" value={degree} readOnly disabled />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small text-muted">Specialization</label>
                <input type="text" className="form-control bg-light" value={spec} readOnly disabled />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small text-muted">Graduation Year</label>
                <input type="text" className="form-control bg-light" value={gradYear} readOnly disabled />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small text-muted">CGPA / Percentage</label>
                <input type="text" className="form-control bg-light" value={cgpa} readOnly disabled />
              </div>
            </div>
          </div>
        </div>

        {/* 4. PROFESSIONAL LINKS SECTION */}
        <div className="col-lg-6">
          <div className="card card-custom p-4 bg-white shadow-sm border-0 h-100 rounded-3">
            <h5 className="fw-bold mb-3 text-primary d-flex align-items-center gap-2">
              <FaLink /> Professional Links
            </h5>

            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-semibold small text-muted">LinkedIn Profile URL</label>
                <div className="input-group">
                  <input type="text" className="form-control bg-light" value={linkedin || 'Not provided'} readOnly disabled />
                  {linkedin && (
                    <a href={linkedin} target="_blank" rel="noreferrer" className="btn btn-outline-primary d-flex align-items-center gap-1">
                      <FaExternalLinkAlt size={12} /> Visit
                    </a>
                  )}
                </div>
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold small text-muted">Portfolio URL</label>
                <div className="input-group">
                  <input type="text" className="form-control bg-light" value={portfolio || 'Not provided'} readOnly disabled />
                  {portfolio && (
                    <a href={portfolio} target="_blank" rel="noreferrer" className="btn btn-outline-primary d-flex align-items-center gap-1">
                      <FaExternalLinkAlt size={12} /> Visit
                    </a>
                  )}
                </div>
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold small text-muted">Other Link (GitHub / LeetCode)</label>
                <div className="input-group">
                  <input type="text" className="form-control bg-light" value={otherLink || 'Not provided'} readOnly disabled />
                  {otherLink && (
                    <a href={otherLink} target="_blank" rel="noreferrer" className="btn btn-outline-primary d-flex align-items-center gap-1">
                      <FaExternalLinkAlt size={12} /> Visit
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminStudentProfileView;
