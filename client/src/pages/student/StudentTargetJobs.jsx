import React, { useContext, useState, useEffect, useRef } from 'react';
import StudentLayout from '../../components/StudentLayout';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import toast from 'react-hot-toast';
import { FaBriefcase, FaEdit, FaTrash, FaPlus, FaTimes, FaSearch, FaExternalLinkAlt } from 'react-icons/fa';

const INDUSTRY_OPTIONS = [
  'IT / Software',
  'Banking',
  'Finance',
  'FinTech',
  'Healthcare',
  'Education',
  'E-Commerce',
  'Retail',
  'Manufacturing',
  'Automobile',
  'Telecom',
  'Consulting',
  'Construction',
  'Real Estate',
  'Hospitality',
  'Travel',
  'Media',
  'Advertising',
  'Government',
  'Logistics',
  'Supply Chain',
  'Other'
];

const COMPANY_SUGGESTIONS = [
  'Google',
  'Microsoft',
  'Amazon',
  'Tata Consultancy Services',
  'Infosys',
  'Wipro',
  'Accenture',
  'Deloitte',
  'Meta',
  'Apple',
  'IBM',
  'Cognizant',
  'HCLTech',
  'Tech Mahindra',
  'Capgemini',
  'Flipkart',
  'Zomato',
  'Paytm',
  'Swiggy',
  'Uber',
  'Cisco',
  'Salesforce',
  'Oracle',
  'Intel',
  'AMD',
  'Adobe',
  'Goldman Sachs',
  'JPMorgan Chase'
];

const EXPERIENCE_OPTIONS = [
  'Fresher',
  '0-1 Years',
  '1-3 Years',
  '3-5 Years',
  '5-8 Years',
  '8+ Years'
];

const JOB_TYPE_OPTIONS = [
  'Full Time',
  'Part Time',
  'Internship',
  'Contract',
  'Remote',
  'Hybrid'
];

const COMMON_SKILLS = [
  'React.js',
  'JavaScript',
  'Node.js',
  'Python',
  'Java',
  'SQL',
  'MongoDB',
  'HTML/CSS',
  'Docker',
  'AWS',
  'C++',
  'Git',
  'Data Analysis',
  'Machine Learning',
  'Communication'
];

const StudentTargetJobs = () => {
  const { user } = useContext(AuthContext);

  // Master job roles from MongoDB
  const [jobRoles, setJobRoles] = useState([]);
  const [targetJobs, setTargetJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form states
  const [targetJobRole, setTargetJobRole] = useState('');
  const [targetIndustry, setTargetIndustry] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [experience, setExperience] = useState('Fresher');
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [jobType, setJobType] = useState('Full Time');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobUrl, setJobUrl] = useState('');

  // Dropdown search & toggle states
  const [roleSearch, setRoleSearch] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [companySearch, setCompanySearch] = useState('');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);

  const roleDropdownRef = useRef(null);
  const companyDropdownRef = useRef(null);

  // Fetch job roles & student's target jobs on mount
  useEffect(() => {
    fetchJobRoles();
    fetchMyTargetJobs();
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target)) {
        setShowRoleDropdown(false);
      }
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(e.target)) {
        setShowCompanyDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchJobRoles = async () => {
    try {
      const res = await API.get('/job-roles');
      if (res.data && res.data.roles) {
        setJobRoles(res.data.roles);
      }
    } catch (err) {
      console.error('Error fetching job roles:', err);
    }
  };

  const fetchMyTargetJobs = async () => {
    try {
      setLoading(true);
      const res = await API.get('/target-jobs');
      if (res.data && res.data.targetJobs) {
        setTargetJobs(res.data.targetJobs);
      }
    } catch (err) {
      console.error('Error fetching target jobs:', err);
      toast.error(err.response?.data?.message || 'Failed to load target jobs');
    } finally {
      setLoading(false);
    }
  };

  // Filtered job roles for searchable dropdown
  const filteredRoles = jobRoles.filter((r) => {
    const name = (r.roleName || r.name || '').toLowerCase();
    const cat = (r.category || '').toLowerCase();
    const q = roleSearch.toLowerCase();
    return name.includes(q) || cat.includes(q);
  });

  // Filtered companies for searchable dropdown
  const filteredCompanies = COMPANY_SUGGESTIONS.filter((c) =>
    c.toLowerCase().includes(companySearch.toLowerCase())
  );

  // Add Skill Tag
  const handleAddSkill = (skillToAdd) => {
    const skill = (skillToAdd || skillInput).trim();
    if (!skill) return;
    if (requiredSkills.some((s) => s.toLowerCase() === skill.toLowerCase())) {
      toast.error('Skill already added');
      return;
    }
    setRequiredSkills([...requiredSkills, skill]);
    setSkillInput('');
  };

  // Remove Skill Tag
  const handleRemoveSkill = (indexToRemove) => {
    setRequiredSkills(requiredSkills.filter((_, idx) => idx !== indexToRemove));
  };

  const resetForm = () => {
    setEditingId(null);
    setTargetJobRole('');
    setTargetIndustry('');
    setTargetCompany('');
    setExperience('Fresher');
    setRequiredSkills([]);
    setSkillInput('');
    setPreferredLocation('');
    setJobType('Full Time');
    setExpectedSalary('');
    setJobDescription('');
    setJobUrl('');
    setRoleSearch('');
    setCompanySearch('');
  };

  // Populate form for Editing
  const startEdit = (job) => {
    setEditingId(job._id);
    setTargetJobRole(job.target_job_role || '');
    setRoleSearch(job.target_job_role || '');
    setTargetIndustry(job.target_industry || '');
    setTargetCompany(job.target_company || '');
    setCompanySearch(job.target_company || '');
    setExperience(job.experience || 'Fresher');
    setRequiredSkills(Array.isArray(job.required_skills) ? job.required_skills : []);
    setPreferredLocation(job.preferred_location || '');
    setJobType(job.job_type || 'Full Time');
    setExpectedSalary(job.expected_salary || '');
    setJobDescription(job.job_description || '');
    setJobUrl(job.job_url || '');

    // Scroll to top of form on mobile/small screens
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Form Submit (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const roleToSave = targetJobRole || roleSearch;
    if (!roleToSave || !roleToSave.trim()) {
      toast.error('Please select or enter a Target Job Role');
      return;
    }

    if (jobUrl && !jobUrl.startsWith('http://') && !jobUrl.startsWith('https://')) {
      toast.error('Job URL must begin with http:// or https://');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        target_job_role: roleToSave.trim(),
        target_industry: targetIndustry.trim(),
        target_company: (targetCompany || companySearch).trim(),
        experience,
        required_skills: requiredSkills,
        preferred_location: preferredLocation.trim(),
        job_type: jobType,
        expected_salary: expectedSalary.trim(),
        job_description: jobDescription.trim(),
        job_url: jobUrl.trim()
      };

      if (editingId) {
        const res = await API.put(`/target-jobs/${editingId}`, payload);
        if (res.data.success) {
          toast.success('Target Job updated successfully!');
          resetForm();
          fetchMyTargetJobs();
        }
      } else {
        const res = await API.post('/target-jobs', payload);
        if (res.data.success) {
          toast.success('Target Job saved successfully!');
          resetForm();
          fetchMyTargetJobs();
        }
      }
    } catch (err) {
      console.error('Error saving target job:', err);
      toast.error(err.response?.data?.message || 'Failed to save target job');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Target Job
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this target job?')) return;
    try {
      const res = await API.delete(`/target-jobs/${id}`);
      if (res.data.success) {
        toast.success('Target Job deleted successfully');
        if (editingId === id) resetForm();
        fetchMyTargetJobs();
      }
    } catch (err) {
      console.error('Error deleting target job:', err);
      toast.error(err.response?.data?.message || 'Failed to delete target job');
    }
  };

  return (
    <StudentLayout>
      <div className="mb-4 text-center text-md-start">
        <h3 className="fw-extrabold mb-1">TARGET JOBS</h3>
        <p className="text-muted small">
          Define your career goals, target roles, preferred companies, and skills for tailored AI interviews
        </p>
      </div>

            <div className="row g-4">
              {/* LEFT HALF — ADD / EDIT TARGET JOB FORM */}
              <div className="col-md-6">
                <div className="card card-custom p-4 bg-white shadow-sm border-0 h-100">
                  <h5 className="fw-bold mb-4 text-primary d-flex align-items-center justify-content-between">
                    <span>{editingId ? 'EDIT TARGET JOB' : 'ADD TARGET JOB'}</span>
                    {editingId && (
                      <span className="badge bg-warning text-dark fs-6 fw-normal">Edit Mode</span>
                    )}
                  </h5>

                  <form onSubmit={handleSubmit}>
                    {/* 1. Target Job Role (Searchable Dropdown) */}
                    <div className="mb-3 position-relative" ref={roleDropdownRef}>
                      <label className="form-label fw-semibold small">
                        Target Job Role <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-white">
                          <FaSearch className="text-muted" />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search job role (e.g. Frontend Developer, Data Analyst)..."
                          value={roleSearch}
                          onChange={(e) => {
                            setRoleSearch(e.target.value);
                            setTargetJobRole(e.target.value);
                            setShowRoleDropdown(true);
                          }}
                          onFocus={() => setShowRoleDropdown(true)}
                          required
                        />
                      </div>

                      {showRoleDropdown && filteredRoles.length > 0 && (
                        <div
                          className="position-absolute w-100 bg-white border rounded-bottom shadow-lg overflow-auto mt-1"
                          style={{ maxHeight: '220px', zIndex: 1050 }}
                        >
                          {filteredRoles.map((r) => {
                            const rName = r.roleName || r.name;
                            return (
                              <button
                                key={r._id}
                                type="button"
                                className="dropdown-item text-wrap py-2 border-bottom d-flex align-items-center justify-content-between"
                                onClick={() => {
                                  setTargetJobRole(rName);
                                  setRoleSearch(rName);
                                  setShowRoleDropdown(false);
                                }}
                              >
                                <span>{rName}</span>
                                <span className="badge bg-light text-secondary small">{r.category}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                      <div className="form-text extra-small text-muted">
                        Select from 270+  roles or type a custom role name.
                      </div>
                    </div>

                    {/* 2. Target Industry */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Target Industry</label>
                      <select
                        className="form-select"
                        value={targetIndustry}
                        onChange={(e) => setTargetIndustry(e.target.value)}
                      >
                        <option value="">-- Select Industry --</option>
                        {INDUSTRY_OPTIONS.map((ind) => (
                          <option key={ind} value={ind}>
                            {ind}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 3. Target Company */}
                    <div className="mb-3 position-relative" ref={companyDropdownRef}>
                      <label className="form-label fw-semibold small">Target Company</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search or enter company name (e.g. Google, TCS)..."
                        value={companySearch}
                        onChange={(e) => {
                          setCompanySearch(e.target.value);
                          setTargetCompany(e.target.value);
                          setShowCompanyDropdown(true);
                        }}
                        onFocus={() => setShowCompanyDropdown(true)}
                      />
                      {showCompanyDropdown && filteredCompanies.length > 0 && (
                        <div
                          className="position-absolute w-100 bg-white border rounded-bottom shadow-lg overflow-auto mt-1"
                          style={{ maxHeight: '180px', zIndex: 1040 }}
                        >
                          {filteredCompanies.map((comp) => (
                            <button
                              key={comp}
                              type="button"
                              className="dropdown-item text-wrap py-2 border-bottom"
                              onClick={() => {
                                setTargetCompany(comp);
                                setCompanySearch(comp);
                                setShowCompanyDropdown(false);
                              }}
                            >
                              🏢 {comp}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 4. Experience & 7. Job Type (2 Columns) */}
                    <div className="row g-2 mb-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold small">Experience</label>
                        <select
                          className="form-select"
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                        >
                          {EXPERIENCE_OPTIONS.map((exp) => (
                            <option key={exp} value={exp}>
                              {exp}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold small">Job Type</label>
                        <select
                          className="form-select"
                          value={jobType}
                          onChange={(e) => setJobType(e.target.value)}
                        >
                          {JOB_TYPE_OPTIONS.map((jt) => (
                            <option key={jt} value={jt}>
                              {jt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* 5. Required Skills (Multi-Select Tags) */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Required Skills</label>
                      <div className="input-group mb-2">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Type skill and press Enter..."
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSkill();
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => handleAddSkill()}
                        >
                          <FaPlus /> Add
                        </button>
                      </div>

                      {/* Display Selected Skill Badges */}
                      <div className="d-flex flex-wrap gap-1 mb-2">
                        {requiredSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="badge bg-primary d-inline-flex align-items-center gap-1 px-2 py-1 fs-6"
                          >
                            {skill}
                            <button
                              type="button"
                              className="btn-close btn-close-white"
                              style={{ width: '0.5rem', height: '0.5rem' }}
                              onClick={() => handleRemoveSkill(idx)}
                            ></button>
                          </span>
                        ))}
                      </div>

                      {/* Quick Skill Suggestions */}
                      <div className="extra-small text-muted">
                        Suggestions:{' '}
                        {COMMON_SKILLS.slice(0, 7).map((s) => (
                          <button
                            key={s}
                            type="button"
                            className="btn btn-link btn-sm p-0 me-2 text-decoration-none text-primary extra-small"
                            onClick={() => handleAddSkill(s)}
                          >
                            +{s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 6. Preferred Location & 8. Expected Salary (2 Columns) */}
                    <div className="row g-2 mb-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold small">Preferred Location</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Bangalore / Hybrid"
                          value={preferredLocation}
                          onChange={(e) => setPreferredLocation(e.target.value)}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold small">Expected Salary</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. 6-8 LPA"
                          value={expectedSalary}
                          onChange={(e) => setExpectedSalary(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* 9. Job Description */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Job Description</label>
                      <textarea
                        rows="3"
                        className="form-control"
                        placeholder="Paste target job description or key responsibilities..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                      ></textarea>
                    </div>

                    {/* 10. Job URL */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold small">Job URL</label>
                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://company.com/jobs/frontend-developer"
                        value={jobUrl}
                        onChange={(e) => setJobUrl(e.target.value)}
                      />
                    </div>

                    {/* Buttons */}
                    <div className="d-flex gap-2">
                      <button
                        type="submit"
                        className="btn btn-primary d-inline-flex align-items-center gap-2"
                        disabled={submitting}
                      >
                        <FaBriefcase />
                        {submitting
                          ? editingId
                            ? 'Updating...'
                            : 'Saving...'
                          : editingId
                          ? 'Update Target Job'
                          : 'Save Target Job'}
                      </button>

                      {editingId && (
                        <button
                          type="button"
                          className="btn btn-secondary d-inline-flex align-items-center gap-2"
                          onClick={resetForm}
                          disabled={submitting}
                        >
                          <FaTimes /> Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {/* RIGHT HALF — MY TARGET JOBS TABLE */}
              <div className="col-md-6">
                <div className="card card-custom p-4 bg-white shadow-sm border-0 h-100">
                  <h5 className="fw-bold mb-4 text-primary">MY TARGET JOBS</h5>

                  {loading ? (
                    <div className="text-center p-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle border">
                        <thead className="table-light">
                          <tr>
                            <th>Job Role</th>
                            <th>Company</th>
                            <th>Industry</th>
                            <th>Location</th>
                            <th>Job Type</th>
                            <th>Experience</th>
                            <th>Expected Salary</th>
                            <th className="text-end">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {targetJobs.length > 0 ? (
                            targetJobs.map((job) => (
                              <tr key={job._id}>
                                <td className="fw-semibold">
                                  <div>{job.target_job_role}</div>
                                  {job.required_skills && job.required_skills.length > 0 && (
                                    <div className="extra-small text-muted mt-1">
                                      Skills: {job.required_skills.slice(0, 3).join(', ')}
                                      {job.required_skills.length > 3 && ` +${job.required_skills.length - 3}`}
                                    </div>
                                  )}
                                  {job.job_url && (
                                    <a
                                      href={job.job_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="extra-small text-primary d-inline-flex align-items-center gap-1 mt-1 text-decoration-none"
                                    >
                                      View Link <FaExternalLinkAlt size={9} />
                                    </a>
                                  )}
                                </td>
                                <td>{job.target_company || '-'}</td>
                                <td>
                                  {job.target_industry ? (
                                    <span className="badge bg-light text-dark border">
                                      {job.target_industry}
                                    </span>
                                  ) : (
                                    '-'
                                  )}
                                </td>
                                <td>{job.preferred_location || '-'}</td>
                                <td>
                                  <span className="badge bg-info text-white">
                                    {job.job_type || 'Full Time'}
                                  </span>
                                </td>
                                <td>{job.experience || '-'}</td>
                                <td>{job.expected_salary || '-'}</td>
                                <td className="text-end">
                                  <div className="d-inline-flex gap-2">
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-warning d-inline-flex align-items-center gap-1"
                                      onClick={() => startEdit(job)}
                                      title="Edit Target Job"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
                                      onClick={() => handleDelete(job._id)}
                                      title="Delete Target Job"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="8" className="text-center text-muted py-4">
                                No target jobs added yet. Fill out the form on the left to add your first target job.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
    </StudentLayout>
  );
};

export default StudentTargetJobs;
