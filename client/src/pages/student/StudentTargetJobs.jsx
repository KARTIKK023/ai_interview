import React, { useContext, useState, useEffect, useRef } from 'react';
import StudentLayout from '../../components/StudentLayout';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import toast from 'react-hot-toast';
import {
  FaBriefcase,
  FaEdit,
  FaTrash,
  FaPlus,
  FaTimes,
  FaSearch,
  FaExternalLinkAlt
} from 'react-icons/fa';

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

/*
 * Companies are grouped by industry.
 * These are frontend suggestions only.
 * User can still type a custom company name.
 */
const COMPANY_SUGGESTIONS = {
  'IT / Software': [
    'Google',
    'Microsoft',
    'Amazon',
    'Meta',
    'Apple',
    'IBM',
    'Cisco',
    'Salesforce',
    'Oracle',
    'Adobe',
    'Intel',
    'AMD',
    'TCS',
    'Infosys',
    'Wipro',
    'HCLTech',
    'Tech Mahindra',
    'Cognizant',
    'Accenture',
    'Capgemini'
  ],

  Banking: [
    'HDFC Bank',
    'ICICI Bank',
    'State Bank of India',
    'Axis Bank',
    'Kotak Mahindra Bank',
    'IndusInd Bank',
    'Bank of Baroda',
    'Yes Bank'
  ],

  Finance: [
    'Goldman Sachs',
    'JPMorgan Chase',
    'Morgan Stanley',
    'Deloitte',
    'PwC',
    'EY',
    'KPMG',
    'BlackRock'
  ],

  FinTech: [
    'Paytm',
    'PhonePe',
    'Razorpay',
    'CRED',
    'Groww',
    'Zerodha',
    'Cashfree',
    'Policybazaar'
  ],

  Healthcare: [
    'Apollo Hospitals',
    'Fortis Healthcare',
    'Max Healthcare',
    'Medanta',
    'Practo',
    'Tata 1mg'
  ],

  Education: [
    'BYJU’S',
    'Unacademy',
    'upGrad',
    'Vedantu',
    'Physics Wallah',
    'Coursera'
  ],

  'E-Commerce': [
    'Amazon',
    'Flipkart',
    'Myntra',
    'Meesho',
    'AJIO',
    'Nykaa'
  ],

  Retail: [
    'Reliance Retail',
    'DMart',
    'Walmart',
    'Lifestyle',
    'Shoppers Stop',
    'Trent'
  ],

  Manufacturing: [
    'Tata Motors',
    'Mahindra',
    'Larsen & Toubro',
    'Reliance Industries',
    'Siemens',
    'Bosch'
  ],

  Automobile: [
    'Tata Motors',
    'Mahindra',
    'Maruti Suzuki',
    'Hyundai',
    'Toyota',
    'Honda',
    'BMW',
    'Mercedes-Benz'
  ],

  Telecom: [
    'Reliance Jio',
    'Airtel',
    'Vodafone Idea',
    'BSNL',
    'Ericsson',
    'Nokia'
  ],

  Consulting: [
    'Deloitte',
    'Accenture',
    'PwC',
    'EY',
    'KPMG',
    'McKinsey & Company',
    'BCG',
    'Bain & Company'
  ],

  Construction: [
    'Larsen & Toubro',
    'Tata Projects',
    'Shapoorji Pallonji',
    'DLF',
    'Adani Infrastructure'
  ],

  'Real Estate': [
    'DLF',
    'Godrej Properties',
    'Prestige Group',
    'Lodha',
    'Sobha',
    'Brigade Group'
  ],

  Hospitality: [
    'Taj Hotels',
    'ITC Hotels',
    'Oberoi Hotels',
    'Marriott',
    'Hilton',
    'Hyatt'
  ],

  Travel: [
    'MakeMyTrip',
    'Goibibo',
    'EaseMyTrip',
    'Cleartrip',
    'Air India',
    'IndiGo'
  ],

  Media: [
    'Times Group',
    'NDTV',
    'Network18',
    'Zee Entertainment',
    'Sony'
  ],

  Advertising: [
    'Ogilvy',
    'Dentsu',
    'Publicis',
    'WPP',
    'Havas'
  ],

  Government: [
    'NIC',
    'ISRO',
    'DRDO',
    'Indian Railways',
    'UPSC',
    'Public Sector Undertakings'
  ],

  Logistics: [
    'Delhivery',
    'DHL',
    'FedEx',
    'Blue Dart',
    'Ecom Express',
    'XpressBees'
  ],

  'Supply Chain': [
    'Amazon',
    'DHL',
    'FedEx',
    'Delhivery',
    'Flipkart',
    'Reliance Industries'
  ],

  Other: []
};

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

/*
 * Fallback role mapping.
 *
 * This is used when the API does not provide an industry
 * field with the job role.
 */
const INDUSTRY_ROLE_MAP = {
  'IT / Software': [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'React Developer',
    'Node.js Developer',
    'Software Engineer',
    'Software Developer',
    'DevOps Engineer',
    'Cloud Engineer',
    'Data Analyst',
    'Data Scientist',
    'Machine Learning Engineer',
    'AI Engineer',
    'QA Engineer',
    'Automation Test Engineer',
    'UI/UX Designer',
    'Cyber Security Analyst',
    'Technical Support Engineer'
  ],

  Banking: [
    'Banking Operations Executive',
    'Relationship Manager',
    'Credit Analyst',
    'Risk Analyst',
    'Investment Analyst',
    'Branch Manager',
    'Financial Analyst',
    'Banking Associate'
  ],

  Finance: [
    'Financial Analyst',
    'Investment Analyst',
    'Equity Research Analyst',
    'Risk Analyst',
    'Credit Analyst',
    'Accountant',
    'Financial Advisor',
    'Portfolio Manager'
  ],

  FinTech: [
    'FinTech Product Manager',
    'Software Engineer',
    'Backend Developer',
    'Frontend Developer',
    'Full Stack Developer',
    'Data Analyst',
    'Risk Analyst',
    'Business Analyst',
    'Product Analyst'
  ],

  Healthcare: [
    'Healthcare Analyst',
    'Healthcare Administrator',
    'Medical Representative',
    'Clinical Research Associate',
    'Healthcare Data Analyst',
    'Hospital Operations Manager'
  ],

  Education: [
    'Teacher',
    'Trainer',
    'Academic Counselor',
    'Instructional Designer',
    'Education Consultant',
    'Content Developer',
    'Education Operations Executive'
  ],

  'E-Commerce': [
    'E-Commerce Manager',
    'Product Manager',
    'Business Analyst',
    'Data Analyst',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Digital Marketing Executive',
    'Operations Executive'
  ],

  Retail: [
    'Store Manager',
    'Retail Sales Executive',
    'Retail Operations Manager',
    'Business Analyst',
    'Category Manager',
    'Supply Chain Analyst',
    'Inventory Manager'
  ],

  Manufacturing: [
    'Production Engineer',
    'Mechanical Engineer',
    'Industrial Engineer',
    'Quality Engineer',
    'Operations Manager',
    'Supply Chain Analyst',
    'Production Manager',
    'Maintenance Engineer'
  ],

  Automobile: [
    'Automotive Engineer',
    'Mechanical Engineer',
    'Production Engineer',
    'Quality Engineer',
    'Automotive Designer',
    'Service Engineer',
    'Supply Chain Analyst',
    'Automotive Software Engineer'
  ],

  Telecom: [
    'Network Engineer',
    'Telecom Engineer',
    'Network Administrator',
    'RF Engineer',
    'Software Engineer',
    'Technical Support Engineer',
    'Cloud Engineer'
  ],

  Consulting: [
    'Business Analyst',
    'Management Consultant',
    'Data Analyst',
    'Financial Analyst',
    'Strategy Consultant',
    'Technology Consultant',
    'HR Consultant'
  ],

  Construction: [
    'Civil Engineer',
    'Site Engineer',
    'Project Manager',
    'Construction Manager',
    'Quantity Surveyor',
    'Structural Engineer',
    'Safety Engineer'
  ],

  'Real Estate': [
    'Real Estate Analyst',
    'Property Manager',
    'Real Estate Consultant',
    'Sales Executive',
    'Business Development Executive',
    'Project Manager'
  ],

  Hospitality: [
    'Hotel Manager',
    'Front Office Executive',
    'Guest Relations Executive',
    'Food & Beverage Manager',
    'Hospitality Operations Manager',
    'Event Manager'
  ],

  Travel: [
    'Travel Consultant',
    'Travel Operations Executive',
    'Travel Agent',
    'Customer Support Executive',
    'Business Development Executive',
    'Travel Product Manager'
  ],

  Media: [
    'Content Writer',
    'Video Editor',
    'Journalist',
    'Social Media Manager',
    'Content Strategist',
    'Media Planner',
    'Graphic Designer'
  ],

  Advertising: [
    'Advertising Executive',
    'Copywriter',
    'Creative Director',
    'Account Manager',
    'Media Planner',
    'Digital Marketing Executive',
    'Social Media Manager'
  ],

  Government: [
    'Administrative Officer',
    'Government Officer',
    'Data Entry Operator',
    'Technical Officer',
    'Software Engineer',
    'Project Officer',
    'Research Officer'
  ],

  Logistics: [
    'Logistics Coordinator',
    'Operations Executive',
    'Supply Chain Analyst',
    'Warehouse Manager',
    'Logistics Manager',
    'Transport Manager'
  ],

  'Supply Chain': [
    'Supply Chain Analyst',
    'Supply Chain Manager',
    'Procurement Analyst',
    'Logistics Coordinator',
    'Inventory Manager',
    'Operations Manager'
  ],

  Other: []
};

const StudentTargetJobs = () => {
  const { user } = useContext(AuthContext);

  const [jobRoles, setJobRoles] = useState([]);
  const [targetJobs, setTargetJobs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

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

  // Search states
  const [roleSearch, setRoleSearch] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const [companySearch, setCompanySearch] = useState('');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);

  const roleDropdownRef = useRef(null);
  const companyDropdownRef = useRef(null);

  useEffect(() => {
    fetchJobRoles();
    fetchMyTargetJobs();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        roleDropdownRef.current &&
        !roleDropdownRef.current.contains(e.target)
      ) {
        setShowRoleDropdown(false);
      }

      if (
        companyDropdownRef.current &&
        !companyDropdownRef.current.contains(e.target)
      ) {
        setShowCompanyDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, []);

  useEffect(() => {
    if (showForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [showForm]);

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

      toast.error(
        err.response?.data?.message ||
          'Failed to load target jobs'
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Get roles according to selected industry.
   *
   * If backend roles contain an industry/category field,
   * we use that.
   *
   * Otherwise we use the frontend fallback mapping.
   */
  const getIndustryRoles = () => {
    if (!targetIndustry) return [];

    const apiRoles = jobRoles.filter((role) => {
      const roleIndustry = (
        role.industry ||
        role.target_industry ||
        role.category ||
        ''
      )
        .toString()
        .toLowerCase();

      return (
        roleIndustry === targetIndustry.toLowerCase() ||
        roleIndustry.includes(targetIndustry.toLowerCase())
      );
    });

    if (apiRoles.length > 0) {
      return apiRoles;
    }

    return (
      INDUSTRY_ROLE_MAP[targetIndustry] || []
    ).map((name, index) => ({
      _id: `fallback-${targetIndustry}-${index}`,
      roleName: name,
      name,
      category: targetIndustry,
      industry: targetIndustry
    }));
  };

  const filteredRoles = getIndustryRoles().filter((r) => {
    const name = (
      r.roleName ||
      r.name ||
      ''
    ).toLowerCase();

    const q = roleSearch.toLowerCase();

    return name.includes(q);
  });

  const availableCompanies =
    COMPANY_SUGGESTIONS[targetIndustry] || [];

  const filteredCompanies = availableCompanies.filter(
    (company) =>
      company
        .toLowerCase()
        .includes(companySearch.toLowerCase())
  );

  /*
   * INDUSTRY CHANGE
   */
  const handleIndustryChange = (e) => {
    const industry = e.target.value;

    setTargetIndustry(industry);

    // Reset dependent fields
    setTargetJobRole('');
    setRoleSearch('');
    setTargetCompany('');
    setCompanySearch('');

    setShowRoleDropdown(false);
    setShowCompanyDropdown(false);
  };

  /*
   * JOB ROLE CHANGE
   */
  const handleRoleSelect = (role) => {
    const roleName = role.roleName || role.name || '';

    setTargetJobRole(roleName);
    setRoleSearch(roleName);

    // Company depends on selected role.
    // Reset it when a new role is selected.
    setTargetCompany('');
    setCompanySearch('');

    setShowRoleDropdown(false);

    // Open company suggestions automatically
    setTimeout(() => {
      setShowCompanyDropdown(true);
    }, 100);
  };

  /*
   * COMPANY SELECT
   */
  const handleCompanySelect = (company) => {
    setTargetCompany(company);
    setCompanySearch(company);
    setShowCompanyDropdown(false);
  };

  const handleAddSkill = (skillToAdd) => {
    const skill = (skillToAdd || skillInput).trim();

    if (!skill) return;

    if (
      requiredSkills.some(
        (s) =>
          s.toLowerCase() === skill.toLowerCase()
      )
    ) {
      toast.error('Skill already added');
      return;
    }

    setRequiredSkills([
      ...requiredSkills,
      skill
    ]);

    setSkillInput('');
  };

  const handleRemoveSkill = (indexToRemove) => {
    setRequiredSkills(
      requiredSkills.filter(
        (_, idx) => idx !== indexToRemove
      )
    );
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

    setShowRoleDropdown(false);
    setShowCompanyDropdown(false);
  };

  const closeForm = () => {
    if (submitting) return;

    resetForm();
    setShowForm(false);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const startEdit = (job) => {
    setEditingId(job._id);

    setTargetIndustry(
      job.target_industry || ''
    );

    setTargetJobRole(
      job.target_job_role || ''
    );

    setRoleSearch(
      job.target_job_role || ''
    );

    setTargetCompany(
      job.target_company || ''
    );

    setCompanySearch(
      job.target_company || ''
    );

    setExperience(
      job.experience || 'Fresher'
    );

    setRequiredSkills(
      Array.isArray(job.required_skills)
        ? job.required_skills
        : []
    );

    setPreferredLocation(
      job.preferred_location || ''
    );

    setJobType(
      job.job_type || 'Full Time'
    );

    setExpectedSalary(
      job.expected_salary || ''
    );

    setJobDescription(
      job.job_description || ''
    );

    setJobUrl(
      job.job_url || ''
    );

    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!targetIndustry) {
      toast.error(
        'Please select a Target Industry'
      );
      return;
    }

    const roleToSave =
      targetJobRole || roleSearch;

    if (!roleToSave || !roleToSave.trim()) {
      toast.error(
        'Please select a Target Job Role'
      );
      return;
    }

    if (
      jobUrl &&
      !jobUrl.startsWith('http://') &&
      !jobUrl.startsWith('https://')
    ) {
      toast.error(
        'Job URL must begin with http:// or https://'
      );
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        target_job_role:
          roleToSave.trim(),

        target_industry:
          targetIndustry.trim(),

        target_company:
          (
            targetCompany ||
            companySearch
          ).trim(),

        experience,

        required_skills:
          requiredSkills,

        preferred_location:
          preferredLocation.trim(),

        job_type:
          jobType,

        expected_salary:
          expectedSalary.trim(),

        job_description:
          jobDescription.trim(),

        job_url:
          jobUrl.trim()
      };

      if (editingId) {
        const res = await API.put(
          `/target-jobs/${editingId}`,
          payload
        );

        if (res.data.success) {
          toast.success(
            'Target Job updated successfully!'
          );

          resetForm();
          setShowForm(false);

          fetchMyTargetJobs();
        }
      } else {
        const res = await API.post(
          '/target-jobs',
          payload
        );

        if (res.data.success) {
          toast.success(
            'Target Job saved successfully!'
          );

          resetForm();
          setShowForm(false);

          fetchMyTargetJobs();
        }
      }
    } catch (err) {
      console.error(
        'Error saving target job:',
        err
      );

      toast.error(
        err.response?.data?.message ||
          'Failed to save target job'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this target job?'
      )
    ) {
      return;
    }

    try {
      const res = await API.delete(
        `/target-jobs/${id}`
      );

      if (res.data.success) {
        toast.success(
          'Target Job deleted successfully'
        );

        if (editingId === id) {
          resetForm();
          setShowForm(false);
        }

        fetchMyTargetJobs();
      }
    } catch (err) {
      console.error(
        'Error deleting target job:',
        err
      );

      toast.error(
        err.response?.data?.message ||
          'Failed to delete target job'
      );
    }
  };

  return (
    <StudentLayout>
      <div className="container-fluid py-2">

        {/* ================= HEADER ================= */}

        <div className="mb-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">

            <div>
              <h3 className="fw-extrabold mb-1">
                MY TARGET JOBS
              </h3>

              <p className="text-muted small mb-0">
                Define your career goals, target
                roles, preferred companies, and skills
                for tailored AI interviews.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary d-inline-flex align-items-center justify-content-center gap-2 px-4"
              onClick={openAddForm}
            >
              <FaPlus size={13} />
              Add Target Job
            </button>

          </div>
        </div>

        {/* ================= TARGET JOBS ================= */}

        <div className="card card-custom bg-white shadow-sm border-0">

          <div className="card-body p-3 p-md-4">

            <div className="d-flex justify-content-between align-items-center mb-4">

              <div>
                <h5 className="fw-bold mb-1">
                  My Target Jobs
                </h5>

                <p className="text-muted small mb-0">
                  {targetJobs.length > 0
                    ? `${targetJobs.length} target job${
                        targetJobs.length !== 1
                          ? 's'
                          : ''
                      } saved`
                    : 'Your saved career targets will appear here'}
                </p>
              </div>

              {targetJobs.length > 0 && (
                <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
                  {targetJobs.length}
                </span>
              )}

            </div>

            {loading ? (
              <div className="text-center py-5">

                <div
                  className="spinner-border text-primary"
                  role="status"
                >
                  <span className="visually-hidden">
                    Loading...
                  </span>
                </div>

                <p className="text-muted small mt-3 mb-0">
                  Loading your target jobs...
                </p>

              </div>
            ) : targetJobs.length > 0 ? (

              <div className="table-responsive">

                <table className="table table-hover align-middle mb-0 target-jobs-table">

                  <thead>
                    <tr>
                      <th>Job Role</th>
                      <th>Company</th>
                      <th>Industry</th>
                      <th>Location</th>
                      <th>Job Type</th>
                      <th>Experience</th>
                      <th>Expected Salary</th>
                      <th className="text-end">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {targetJobs.map((job) => (
                      <tr key={job._id}>

                        <td>

                          <div className="fw-semibold text-dark">
                            {job.target_job_role}
                          </div>

                          {job.required_skills &&
                            job.required_skills.length >
                              0 && (
                              <div className="small text-muted mt-1">
                                Skills:{' '}
                                {job.required_skills
                                  .slice(0, 3)
                                  .join(', ')}

                                {job.required_skills
                                  .length > 3 &&
                                  ` +${
                                    job.required_skills
                                      .length - 3
                                  }`}
                              </div>
                            )}

                          {job.job_url && (
                            <a
                              href={job.job_url}
                              target="_blank"
                              rel="noreferrer"
                              className="small text-primary d-inline-flex align-items-center gap-1 mt-1 text-decoration-none"
                            >
                              View Job Link
                              <FaExternalLinkAlt size={9} />
                            </a>
                          )}

                        </td>

                        <td>
                          {job.target_company || (
                            <span className="text-muted">
                              —
                            </span>
                          )}
                        </td>

                        <td>
                          {job.target_industry ? (
                            <span className="badge rounded-pill bg-light text-dark border px-3 py-2">
                              {job.target_industry}
                            </span>
                          ) : (
                            <span className="text-muted">
                              —
                            </span>
                          )}
                        </td>

                        <td>
                          {job.preferred_location || (
                            <span className="text-muted">
                              —
                            </span>
                          )}
                        </td>

                        <td>
                          <span className="badge rounded-pill bg-info bg-opacity-10 text-info border border-info-subtle px-3 py-2">
                            {job.job_type ||
                              'Full Time'}
                          </span>
                        </td>

                        <td>
                          {job.experience || (
                            <span className="text-muted">
                              —
                            </span>
                          )}
                        </td>

                        <td>
                          {job.expected_salary || (
                            <span className="text-muted">
                              —
                            </span>
                          )}
                        </td>

                        <td className="text-end">

                          <div className="d-inline-flex gap-2">

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-warning d-inline-flex align-items-center gap-1"
                              onClick={() =>
                                startEdit(job)
                              }
                            >
                              <FaEdit size={12} />
                              Edit
                            </button>

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
                              onClick={() =>
                                handleDelete(
                                  job._id
                                )
                              }
                            >
                              <FaTrash size={11} />
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>

            ) : (

              <div className="text-center py-5 px-3">

                <div
                  className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10"
                  style={{
                    width: '72px',
                    height: '72px'
                  }}
                >
                  <FaBriefcase
                    className="text-primary"
                    size={28}
                  />
                </div>

                <h5 className="fw-bold mb-2">
                  No Target Jobs Yet
                </h5>

                <p
                  className="text-muted small mx-auto mb-4"
                  style={{
                    maxWidth: '480px'
                  }}
                >
                  Add your target job role,
                  preferred company, skills and
                  other career preferences to get
                  more personalized AI interviews.
                </p>

                <button
                  type="button"
                  className="btn btn-primary px-4 d-inline-flex align-items-center gap-2"
                  onClick={openAddForm}
                >
                  <FaPlus size={12} />
                  Add Your First Target Job
                </button>

              </div>

            )}

          </div>

        </div>

      </div>

      {/* =====================================================
          ADD / EDIT TARGET JOB MODAL
      ===================================================== */}

      {showForm && (
        <div
          className="target-job-modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeForm();
            }
          }}
        >

          <div className="target-job-modal">

            {/* MODAL HEADER */}

            <div className="target-job-modal-header">

              <div>

                <div className="d-flex align-items-center gap-2 mb-1">

                  <div
                    className="d-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10"
                    style={{
                      width: '38px',
                      height: '38px'
                    }}
                  >
                    <FaBriefcase className="text-primary" />
                  </div>

                  <h5 className="fw-bold mb-0">
                    {editingId
                      ? 'Edit Target Job'
                      : 'Add Target Job'}
                  </h5>

                </div>

                <p className="text-muted small mb-0">
                  {editingId
                    ? 'Update your target job preferences.'
                    : 'Tell us what kind of job you are targeting.'}
                </p>

              </div>

              <button
                type="button"
                className="btn btn-light rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: '36px',
                  height: '36px'
                }}
                onClick={closeForm}
                disabled={submitting}
              >
                <FaTimes size={14} />
              </button>

            </div>

            {/* MODAL BODY */}

            <div className="target-job-modal-body">

              <form onSubmit={handleSubmit}>

                <div className="row g-3">

                  {/* =================================================
                      1. INDUSTRY
                  ================================================= */}

                  <div className="col-md-6">

                    <label className="form-label fw-semibold small">
                      Target Industry{' '}
                      <span className="text-danger">
                        *
                      </span>
                    </label>

                    <select
                      className="form-select"
                      value={targetIndustry}
                      onChange={handleIndustryChange}
                      required
                    >
                      <option
                        value=""
                        disabled
                      >
                        Select your target industry
                      </option>

                      {INDUSTRY_OPTIONS.map(
                        (industry) => (
                          <option
                            key={industry}
                            value={industry}
                          >
                            {industry}
                          </option>
                        )
                      )}

                    </select>

                    <div className="form-text target-placeholder-help">
                      Select your preferred industry first.
                    </div>

                  </div>

                  {/* =================================================
                      2. JOB ROLE
                  ================================================= */}

                  <div
                    className="col-md-6 position-relative"
                    ref={roleDropdownRef}
                  >

                    <label className="form-label fw-semibold small">
                      Target Job Role{' '}
                      <span className="text-danger">
                        *
                      </span>
                    </label>

                    <div className="input-group target-input-group">

                      <span className="input-group-text">
                        <FaSearch
                          size={13}
                          className="text-muted"
                        />
                      </span>

                      <input
                        type="text"
                        className="form-control"
                        placeholder={
                          targetIndustry
                            ? 'Search job role...'
                            : 'Select industry first...'
                        }
                        value={roleSearch}
                        disabled={!targetIndustry}
                        onChange={(e) => {
                          setRoleSearch(
                            e.target.value
                          );

                          setTargetJobRole(
                            e.target.value
                          );

                          setShowRoleDropdown(true);
                        }}
                        onFocus={() => {
                          if (targetIndustry) {
                            setShowRoleDropdown(
                              true
                            );
                          }
                        }}
                        required
                      />

                    </div>

                    {targetIndustry &&
                      showRoleDropdown &&
                      filteredRoles.length > 0 && (
                        <div className="target-dropdown">

                          {filteredRoles.map(
                            (role) => {
                              const roleName =
                                role.roleName ||
                                role.name;

                              return (
                                <button
                                  key={role._id}
                                  type="button"
                                  className="target-dropdown-item"
                                  onClick={() =>
                                    handleRoleSelect(
                                      role
                                    )
                                  }
                                >
                                  <span>
                                    {roleName}
                                  </span>

                                  <span className="badge bg-light text-secondary">
                                    {targetIndustry}
                                  </span>
                                </button>
                              );
                            }
                          )}

                        </div>
                      )}

                    {targetIndustry &&
                      showRoleDropdown &&
                      filteredRoles.length ===
                        0 && (
                        <div className="target-dropdown">

                          <div className="px-3 py-3 text-muted small">
                            No matching roles found.
                            You can type a custom
                            role.
                          </div>

                        </div>
                      )}

                    <div className="form-text target-placeholder-help">
                      {targetIndustry
                        ? `Showing roles related to ${targetIndustry}.`
                        : 'Select an industry to see relevant roles.'}
                    </div>

                  </div>

                  {/* =================================================
                      3. COMPANY
                  ================================================= */}

                  <div
                    className="col-md-6 position-relative"
                    ref={companyDropdownRef}
                  >

                    <label className="form-label fw-semibold small">
                      Target Company
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder={
                        !targetIndustry
                          ? 'Select industry first...'
                          : !targetJobRole
                          ? 'Select job role first...'
                          : 'Search or enter company...'
                      }
                      value={companySearch}
                      disabled={
                        !targetIndustry ||
                        !targetJobRole
                      }
                      onChange={(e) => {
                        setCompanySearch(
                          e.target.value
                        );

                        setTargetCompany(
                          e.target.value
                        );

                        setShowCompanyDropdown(
                          true
                        );
                      }}
                      onFocus={() => {
                        if (
                          targetIndustry &&
                          targetJobRole
                        ) {
                          setShowCompanyDropdown(
                            true
                          );
                        }
                      }}
                    />

                    {targetIndustry &&
                      targetJobRole &&
                      showCompanyDropdown &&
                      filteredCompanies.length >
                        0 && (
                        <div className="target-dropdown">

                          {filteredCompanies.map(
                            (company) => (
                              <button
                                key={company}
                                type="button"
                                className="target-dropdown-item"
                                onClick={() =>
                                  handleCompanySelect(
                                    company
                                  )
                                }
                              >
                                <span>
                                  {company}
                                </span>
                              </button>
                            )
                          )}

                        </div>
                      )}

                    {targetIndustry &&
                      targetJobRole &&
                      showCompanyDropdown &&
                      filteredCompanies.length ===
                        0 && (
                        <div className="target-dropdown">

                          <div className="px-3 py-3 text-muted small">
                            No suggested companies.
                            You can enter a custom
                            company name.
                          </div>

                        </div>
                      )}

                    <div className="form-text target-placeholder-help">
                      {targetJobRole
                        ? 'Select a suggested company or type your own.'
                        : 'Select a job role to see relevant companies.'}
                    </div>

                  </div>

                  {/* =================================================
                      4. EXPERIENCE
                  ================================================= */}

                  <div className="col-md-3 col-6">

                    <label className="form-label fw-semibold small">
                      Experience
                    </label>

                    <select
                      className="form-select"
                      value={experience}
                      onChange={(e) =>
                        setExperience(
                          e.target.value
                        )
                      }
                    >
                      {EXPERIENCE_OPTIONS.map(
                        (exp) => (
                          <option
                            key={exp}
                            value={exp}
                          >
                            {exp}
                          </option>
                        )
                      )}
                    </select>

                  </div>

                  {/* =================================================
                      5. JOB TYPE
                  ================================================= */}

                  <div className="col-md-3 col-6">

                    <label className="form-label fw-semibold small">
                      Job Type
                    </label>

                    <select
                      className="form-select"
                      value={jobType}
                      onChange={(e) =>
                        setJobType(
                          e.target.value
                        )
                      }
                    >
                      {JOB_TYPE_OPTIONS.map(
                        (type) => (
                          <option
                            key={type}
                            value={type}
                          >
                            {type}
                          </option>
                        )
                      )}
                    </select>

                  </div>

                  {/* =================================================
                      6. LOCATION
                  ================================================= */}

                  <div className="col-md-6">

                    <label className="form-label fw-semibold small">
                      Preferred Location
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Bangalore, Delhi, Remote"
                      value={preferredLocation}
                      onChange={(e) =>
                        setPreferredLocation(
                          e.target.value
                        )
                      }
                    />

                  </div>

                  {/* =================================================
                      7. SALARY
                  ================================================= */}

                  <div className="col-md-6">

                    <label className="form-label fw-semibold small">
                      Expected Salary
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 6-8 LPA"
                      value={expectedSalary}
                      onChange={(e) =>
                        setExpectedSalary(
                          e.target.value
                        )
                      }
                    />

                  </div>

                  {/* =================================================
                      8. SKILLS
                  ================================================= */}

                  <div className="col-12">

                    <label className="form-label fw-semibold small">
                      Required Skills
                    </label>

                    <div className="input-group">

                      <input
                        type="text"
                        className="form-control"
                        placeholder="Type a skill and press Enter..."
                        value={skillInput}
                        onChange={(e) =>
                          setSkillInput(
                            e.target.value
                          )
                        }
                        onKeyDown={(e) => {
                          if (
                            e.key === 'Enter'
                          ) {
                            e.preventDefault();

                            handleAddSkill();
                          }
                        }}
                      />

                      <button
                        type="button"
                        className="btn btn-outline-secondary px-3"
                        onClick={() =>
                          handleAddSkill()
                        }
                      >
                        <FaPlus size={11} />
                        {' '}
                        Add
                      </button>

                    </div>

                    {requiredSkills.length >
                      0 && (
                      <div className="d-flex flex-wrap gap-2 mt-2">

                        {requiredSkills.map(
                          (skill, idx) => (
                            <span
                              key={idx}
                              className="badge bg-primary d-inline-flex align-items-center gap-2 px-3 py-2"
                            >
                              {skill}

                              <button
                                type="button"
                                className="btn-close btn-close-white"
                                style={{
                                  width:
                                    '0.45rem',
                                  height:
                                    '0.45rem'
                                }}
                                onClick={() =>
                                  handleRemoveSkill(
                                    idx
                                  )
                                }
                              />
                            </span>
                          )
                        )}

                      </div>
                    )}

                    <div className="mt-2">

                      <span className="small text-muted me-2">
                        Suggestions:
                      </span>

                      {COMMON_SKILLS.slice(
                        0,
                        7
                      ).map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          className="btn btn-link btn-sm p-0 me-3 text-decoration-none small"
                          onClick={() =>
                            handleAddSkill(
                              skill
                            )
                          }
                        >
                          +{skill}
                        </button>
                      ))}

                    </div>

                  </div>

                  {/* =================================================
                      9. JOB DESCRIPTION
                  ================================================= */}

                  <div className="col-12">

                    <label className="form-label fw-semibold small">
                      Job Description
                    </label>

                    <textarea
                      rows="3"
                      className="form-control"
                      placeholder="Paste the job description or key responsibilities..."
                      value={jobDescription}
                      onChange={(e) =>
                        setJobDescription(
                          e.target.value
                        )
                      }
                    />

                  </div>

                  {/* =================================================
                      10. JOB URL
                  ================================================= */}

                  <div className="col-12">

                    <label className="form-label fw-semibold small">
                      Job URL
                    </label>

                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://company.com/jobs/..."
                      value={jobUrl}
                      onChange={(e) =>
                        setJobUrl(
                          e.target.value
                        )
                      }
                    />

                    <div className="form-text target-placeholder-help">
                      Optional — add the original
                      job posting link.
                    </div>

                  </div>

                </div>

                {/* FORM FOOTER */}

                <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">

                  <button
                    type="button"
                    className="btn btn-light border px-4"
                    onClick={closeForm}
                    disabled={submitting}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary px-4 d-inline-flex align-items-center gap-2"
                    disabled={submitting}
                  >
                    <FaBriefcase size={13} />

                    {submitting
                      ? editingId
                        ? 'Updating...'
                        : 'Saving...'
                      : editingId
                      ? 'Update Target Job'
                      : 'Save Target Job'}
                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>
      )}

      {/* ================= CUSTOM UI ================= */}

      <style>{`

        .target-jobs-table {
          border-collapse: separate;
          border-spacing: 0;
        }

        .target-jobs-table thead th {
          background: #f8fafc;
          color: #475569;
          font-size: 0.76rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.025em;
          padding: 14px 12px;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
        }

        .target-jobs-table tbody td {
          padding: 16px 12px;
          border-bottom: 1px solid #eef2f7;
          font-size: 0.88rem;
        }

        .target-jobs-table tbody tr:last-child td {
          border-bottom: none;
        }

        .target-jobs-table tbody tr:hover {
          background: #fafcff;
        }

        /* ================= MODAL ================= */

        .target-job-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: targetModalFadeIn 0.18s ease-out;
        }

        .target-job-modal {
          width: min(920px, 100%);
          max-height: calc(100vh - 40px);
          background: #ffffff;
          border-radius: 18px;
          box-shadow:
            0 25px 70px rgba(15, 23, 42, 0.25);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: targetModalSlideUp 0.2s ease-out;
        }

        .target-job-modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid #e9eef5;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          flex-shrink: 0;
        }

        .target-job-modal-body {
          padding: 22px 24px 24px;
          overflow-y: auto;
        }

        /* ================= INPUTS ================= */

        .target-job-modal .form-control,
        .target-job-modal .form-select {
          min-height: 44px;
          border-color: #dbe2ea;
          border-radius: 9px;
          font-size: 0.88rem;
          color: #1e293b;
          box-shadow: none;
          transition: all 0.15s ease;
        }

        .target-job-modal .form-control:focus,
        .target-job-modal .form-select:focus {
          border-color: #86b7fe;
          box-shadow:
            0 0 0 0.2rem
            rgba(13, 110, 253, 0.08);
        }

        .target-job-modal .form-control::placeholder {
          color: #a8b1bd;
          opacity: 1;
          font-size: 0.83rem;
        }

        .target-job-modal .form-control:disabled {
          background: #f8fafc;
          color: #94a3b8;
          cursor: not-allowed;
        }

        .target-job-modal .input-group-text {
          background: #ffffff;
          border-color: #dbe2ea;
          border-radius: 9px 0 0 9px;
          padding-left: 13px;
          padding-right: 10px;
        }

        .target-input-group .form-control {
          border-left: 0;
          border-radius: 0 9px 9px 0;
        }

        .target-job-modal .form-label {
          color: #334155;
          margin-bottom: 7px;
        }

        .target-placeholder-help {
          color: #94a3b8 !important;
          font-size: 0.72rem;
        }

        /* ================= DROPDOWN ================= */

        .target-dropdown {
          position: absolute;
          left: 12px;
          right: 12px;
          top: calc(100% - 1px);
          background: #ffffff;
          border: 1px solid #dbe2ea;
          border-radius: 0 0 10px 10px;
          box-shadow:
            0 12px 30px
            rgba(15, 23, 42, 0.12);
          max-height: 210px;
          overflow-y: auto;
          z-index: 10000;
        }

        .target-dropdown-item {
          width: 100%;
          border: 0;
          background: #ffffff;
          padding: 11px 13px;
          text-align: left;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          font-size: 0.84rem;
          color: #334155;
          border-bottom: 1px solid #f1f5f9;
        }

        .target-dropdown-item:last-child {
          border-bottom: 0;
        }

        .target-dropdown-item:hover {
          background: #f8fafc;
        }

        /* ================= ANIMATION ================= */

        @keyframes targetModalFadeIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes targetModalSlideUp {
          from {
            opacity: 0;
            transform:
              translateY(15px)
              scale(0.98);
          }

          to {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }
        }

        /* ================= MOBILE ================= */

        @media (max-width: 767.98px) {

          .target-job-modal-backdrop {
            padding: 10px;
          }

          .target-job-modal {
            max-height:
              calc(100vh - 20px);
            border-radius: 14px;
          }

          .target-job-modal-header {
            padding: 16px;
          }

          .target-job-modal-body {
            padding:
              18px 16px 20px;
          }

          .target-jobs-table {
            min-width: 950px;
          }

        }

      `}</style>

    </StudentLayout>
  );
};

export default StudentTargetJobs;