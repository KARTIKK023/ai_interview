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
      setError(err.response?.data?.message || 'Failed to load profile progress');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="p-5 text-center text-muted">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading progress...</span>
          </div>
          <p>Calculating your dynamic profile progress...</p>
        </div>
      </StudentLayout>
    );
  }

  if (error || !data) {
    return (
      <StudentLayout>
        <div className="p-4 text-center text-danger bg-danger bg-opacity-10 border border-danger rounded">
          <FaExclamationCircle className="fs-2 mb-2" />
          <h5>Error Loading Profile Progress</h5>
          <p className="small mb-3">{error || 'Something went wrong while calculating progress.'}</p>
          <button className="btn btn-outline-danger btn-sm" onClick={fetchProfileProgress}>
            Retry
          </button>
        </div>
      </StudentLayout>
    );
  }

  const { progress, completedWeight, remainingWeight, sections } = data;
  const reg = sections.registration || { weight: 15, completed: 0, percentage: 0, fields: {} };
  const personal = sections.personal || { weight: 15, completed: 0, percentage: 0, fields: {} };
  const edu = sections.education || { weight: 25, completed: 0, percentage: 0, fields: {} };
  const resume = sections.resume || { weight: 30, completed: 0, percentage: 0, fields: {} };
  const links = sections.professionalLinks || { weight: 15, completed: 0, percentage: 0, fields: {} };

  return (
    <StudentLayout>
      {/* HEADER SECTION */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h3 className="fw-extrabold mb-1">PROFILE PROGRESS</h3>
          <p className="text-muted small mb-0">
            Track and complete your profile criteria calculated dynamically from your MongoDB student data.
          </p>
        </div>
        <Link to="/student/profile" className="btn btn-primary-custom d-flex align-items-center gap-2">
          Complete Profile <FaArrowRight size={14} />
        </Link>
      </div>

      {/* OVERALL COMPLETION CARD */}
      <div className="card card-custom p-4 mb-4 bg-white shadow-sm border-0">
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between mb-3 gap-3">
          <div>
            <h5 className="fw-bold text-dark mb-1">Overall Profile Completion</h5>
            <p className="text-muted small mb-0">
              Completing all sections improves your interview readiness and recruiter ATS visibility.
            </p>
          </div>
          <div className="display-4 fw-extrabold text-primary mb-0">
            {progress}%
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="progress mb-3" style={{ height: '14px', borderRadius: '7px' }}>
          <div
            className="progress-bar bg-primary progress-bar-striped progress-bar-animated"
            role="progressbar"
            style={{ width: `${progress}%` }}
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>

        <div className="d-flex justify-content-between align-items-center fw-bold small">
          <span className="text-success d-flex align-items-center gap-1">
            <FaCheckCircle /> {completedWeight}% Completed
          </span>
          <span className="text-secondary">
            {remainingWeight}% Remaining
          </span>
        </div>
      </div>

      {/* SECTION BREAKDOWNS (5 CATEGORIES) */}
      <div className="row g-4 mb-4">
        {/* 1. REGISTRATION INFORMATION (15%) */}
        <div className="col-lg-6">
          <div className="card card-custom p-4 bg-white shadow-sm border-0 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <FaIdCard className="text-primary" /> Registration Information
              </h5>
              <span className="badge bg-primary bg-opacity-10 text-primary border border-primary px-3 py-1">
                {reg.completed} / {reg.weight}%
              </span>
            </div>

            <p className="text-muted extra-small mb-3">Weight: 15% (Full Name 5%, Email 5%, Mobile 5%)</p>

            <ul className="list-group list-group-flush small">
              <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-2 border-0">
                <span className="d-flex align-items-center gap-2">
                  {reg.fields.fullName ? <FaCheckCircle className="text-success" /> : <FaRegCircle className="text-muted" />}
                  Full Name
                </span>
                <span className={`fw-bold extra-small ${reg.fields.fullName ? 'text-success' : 'text-muted'}`}>
                  {reg.fields.fullName ? '+5%' : '0%'}
                </span>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-2 border-0">
                <span className="d-flex align-items-center gap-2">
                  {reg.fields.email ? <FaCheckCircle className="text-success" /> : <FaRegCircle className="text-muted" />}
                  Email Address
                </span>
                <span className={`fw-bold extra-small ${reg.fields.email ? 'text-success' : 'text-muted'}`}>
                  {reg.fields.email ? '+5%' : '0%'}
                </span>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-2 border-0">
                <span className="d-flex align-items-center gap-2">
                  {reg.fields.mobileNumber ? <FaCheckCircle className="text-success" /> : <FaRegCircle className="text-muted" />}
                  Mobile Number
                </span>
                <span className={`fw-bold extra-small ${reg.fields.mobileNumber ? 'text-success' : 'text-muted'}`}>
                  {reg.fields.mobileNumber ? '+5%' : '0%'}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* 2. PERSONAL INFORMATION (15%) */}
        <div className="col-lg-6">
          <div className="card card-custom p-4 bg-white shadow-sm border-0 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <FaUser className="text-primary" /> Personal Information
              </h5>
              <span className="badge bg-primary bg-opacity-10 text-primary border border-primary px-3 py-1">
                {personal.completed} / {personal.weight}%
              </span>
            </div>

            <p className="text-muted extra-small mb-3">Weight: 15% (3% per field)</p>

            <ul className="list-group list-group-flush small">
              <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-2 border-0">
                <span className="d-flex align-items-center gap-2">
                  {personal.fields.profilePhoto ? <FaCheckCircle className="text-success" /> : <FaRegCircle className="text-muted" />}
                  Profile Photo
                </span>
                <span className={`fw-bold extra-small ${personal.fields.profilePhoto ? 'text-success' : 'text-muted'}`}>
                  {personal.fields.profilePhoto ? '+3%' : '0%'}
                </span>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-2 border-0">
                <span className="d-flex align-items-center gap-2">
                  {personal.fields.dateOfBirth ? <FaCheckCircle className="text-success" /> : <FaRegCircle className="text-muted" />}
                  Date of Birth
                </span>
                <span className={`fw-bold extra-small ${personal.fields.dateOfBirth ? 'text-success' : 'text-muted'}`}>
                  {personal.fields.dateOfBirth ? '+3%' : '0%'}
                </span>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-2 border-0">
                <span className="d-flex align-items-center gap-2">
                  {personal.fields.gender ? <FaCheckCircle className="text-success" /> : <FaRegCircle className="text-muted" />}
                  Gender
                </span>
                <span className={`fw-bold extra-small ${personal.fields.gender ? 'text-success' : 'text-muted'}`}>
                  {personal.fields.gender ? '+3%' : '0%'}
                </span>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-2 border-0">
                <span className="d-flex align-items-center gap-2">
                  {personal.fields.location ? <FaCheckCircle className="text-success" /> : <FaRegCircle className="text-muted" />}
                  Location
                </span>
                <span className={`fw-bold extra-small ${personal.fields.location ? 'text-success' : 'text-muted'}`}>
                  {personal.fields.location ? '+3%' : '0%'}
                </span>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-2 border-0">
                <span className="d-flex align-items-center gap-2">
                  {personal.fields.bio ? <FaCheckCircle className="text-success" /> : <FaRegCircle className="text-muted" />}
                  About / Bio
                </span>
                <span className={`fw-bold extra-small ${personal.fields.bio ? 'text-success' : 'text-muted'}`}>
                  {personal.fields.bio ? '+3%' : '0%'}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* 3. EDUCATION (25%) */}
        <div className="col-lg-6">
          <div className="card card-custom p-4 bg-white shadow-sm border-0 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <FaGraduationCap className="text-primary" /> Education
              </h5>
              <span className="badge bg-primary bg-opacity-10 text-primary border border-primary px-3 py-1">
                {edu.completed} / {edu.weight}%
              </span>
            </div>

            <p className="text-muted extra-small mb-3">Weight: 25% (Qualification 5%, College 5%, Degree 4%, Specialization 4%, Year 4%, CGPA 3%)</p>

            <ul className="list-group list-group-flush small">
              <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-2 border-0">
                <span className="d-flex align-items-center gap-2">
                  {edu.fields.highestQualification ? <FaCheckCircle className="text-success" /> : <FaRegCircle className="text-muted" />}
                  Highest Qualification
                </span>
                <span className={`fw-bold extra-small ${edu.fields.highestQualification ? 'text-success' : 'text-muted'}`}>
                  {edu.fields.highestQualification ? '+5%' : '0%'}
                </span>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-2 border-0">
                <span className="d-flex align-items-center gap-2">
                  {edu.fields.collegeUniversity ? <FaCheckCircle className="text-success" /> : <FaRegCircle className="text-muted" />}
                  College / University
                </span>
                <span className={`fw-bold extra-small ${edu.fields.collegeUniversity ? 'text-success' : 'text-muted'}`}>
                  {edu.fields.collegeUniversity ? '+5%' : '0%'}
                </span>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-2 border-0">
                <span className="d-flex align-items-center gap-2">
                  {edu.fields.degree ? <FaCheckCircle className="text-success" /> : <FaRegCircle className="text-muted" />}
                  Degree
                </span>
                <span className={`fw-bold extra-small ${edu.fields.degree ? 'text-success' : 'text-muted'}`}>
                  {edu.fields.degree ? '+4%' : '0%'}
                </span>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-2 border-0">
                <span className="d-flex align-items-center gap-2">
                  {edu.fields.specialization ? <FaCheckCircle className="text-success" /> : <FaRegCircle className="text-muted" />}
                  Specialization
                </span>
                <span className={`fw-bold extra-small ${edu.fields.specialization ? 'text-success' : 'text-muted'}`}>
                  {edu.fields.specialization ? '+4%' : '0%'}
                </span>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-2 border-0">
                <span className="d-flex align-items-center gap-2">
                  {edu.fields.graduationYear ? <FaCheckCircle className="text-success" /> : <FaRegCircle className="text-muted" />}
                  Graduation Year
                </span>
                <span className={`fw-bold extra-small ${edu.fields.graduationYear ? 'text-success' : 'text-muted'}`}>
                  {edu.fields.graduationYear ? '+4%' : '0%'}
                </span>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-2 border-0">
                <span className="d-flex align-items-center gap-2">
                  {edu.fields.cgpaPercentage ? <FaCheckCircle className="text-success" /> : <FaRegCircle className="text-muted" />}
                  CGPA / Percentage
                </span>
                <span className={`fw-bold extra-small ${edu.fields.cgpaPercentage ? 'text-success' : 'text-muted'}`}>
                  {edu.fields.cgpaPercentage ? '+3%' : '0%'}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* 4. RESUME (30%) */}
        <div className="col-lg-6">
          <div className="card card-custom p-4 bg-white shadow-sm border-0 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <FaFilePdf className="text-danger" /> Resume PDF
              </h5>
              <span className="badge bg-primary bg-opacity-10 text-primary border border-primary px-3 py-1">
                {resume.completed} / {resume.weight}%
              </span>
            </div>

            <p className="text-muted extra-small mb-3">Weight: 30% (Uploaded Resume PDF Document in MongoDB)</p>

            <ul className="list-group list-group-flush small mb-3">
              <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3 border-0">
                <span className="d-flex align-items-center gap-2">
                  {resume.fields.resumePdf ? <FaCheckCircle className="text-success fs-5" /> : <FaRegCircle className="text-muted fs-5" />}
                  Uploaded Resume Document (PDF)
                </span>
                <span className={`fw-bold ${resume.fields.resumePdf ? 'text-success' : 'text-muted'}`}>
                  {resume.fields.resumePdf ? '+30%' : '0%'}
                </span>
              </li>
            </ul>

            <div className="mt-auto">
              <Link to="/student/resume" className="btn btn-outline-primary btn-sm w-100 fw-bold">
                {resume.fields.resumePdf ? 'Manage Resume' : 'Upload Resume (+30%)'}
              </Link>
            </div>
          </div>
        </div>

        {/* 5. PROFESSIONAL LINKS (15%) */}
        <div className="col-lg-12">
          <div className="card card-custom p-4 bg-white shadow-sm border-0">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <FaLink className="text-primary" /> Professional Links
              </h5>
              <span className="badge bg-primary bg-opacity-10 text-primary border border-primary px-3 py-1">
                {links.completed} / {links.weight}%
              </span>
            </div>

            <p className="text-muted extra-small mb-3">Weight: 15% (LinkedIn 5%, Portfolio 5%, Other Link 5%)</p>

            <div className="row g-3">
              <div className="col-md-4">
                <div className="p-3 bg-light rounded border d-flex justify-content-between align-items-center">
                  <span className="d-flex align-items-center gap-2 small">
                    {links.fields.linkedin ? <FaCheckCircle className="text-success" /> : <FaRegCircle className="text-muted" />}
                    LinkedIn Profile
                  </span>
                  <span className={`fw-bold extra-small ${links.fields.linkedin ? 'text-success' : 'text-muted'}`}>
                    {links.fields.linkedin ? '+5%' : '0%'}
                  </span>
                </div>
              </div>
              <div className="col-md-4">
                <div className="p-3 bg-light rounded border d-flex justify-content-between align-items-center">
                  <span className="d-flex align-items-center gap-2 small">
                    {links.fields.portfolio ? <FaCheckCircle className="text-success" /> : <FaRegCircle className="text-muted" />}
                    Personal Portfolio
                  </span>
                  <span className={`fw-bold extra-small ${links.fields.portfolio ? 'text-success' : 'text-muted'}`}>
                    {links.fields.portfolio ? '+5%' : '0%'}
                  </span>
                </div>
              </div>
              <div className="col-md-4">
                <div className="p-3 bg-light rounded border d-flex justify-content-between align-items-center">
                  <span className="d-flex align-items-center gap-2 small">
                    {links.fields.other ? <FaCheckCircle className="text-success" /> : <FaRegCircle className="text-muted" />}
                    Other Professional Link
                  </span>
                  <span className={`fw-bold extra-small ${links.fields.other ? 'text-success' : 'text-muted'}`}>
                    {links.fields.other ? '+5%' : '0%'}
                  </span>
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
