import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { FaFileAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import DataTable from './components/DataTable';
import SuperAdminStudentProfileView from './components/SuperAdminStudentProfileView';

const SuperAdminResumes = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const [selectedMonth, setSelectedMonth] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/resumes');
      if (res.data && res.data.success) {
      const resumesWithSerialNumber = (res.data.resumes || []).map(
        (resume, index) => ({
          ...resume,
          serialNumber: index + 1
        })
      );

      setResumes(resumesWithSerialNumber);
    }
    } catch (err) {
      console.error('Failed to load resumes:', err);
      toast.error('Failed to fetch resume records from database.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewResume = async (id, fileName) => {
    try {
      toast.loading(`Opening ${fileName || 'resume'}...`, { id: 'resume-load' });
      const res = await API.get(`/resume/file/${id}`, { responseType: 'blob' });
      const fileBlob = new Blob([res.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(fileBlob);
      window.open(fileURL, '_blank');
      toast.success(`Opened ${fileName || 'resume'} in new tab`, { id: 'resume-load' });
    } catch (err) {
      console.error('Failed to view resume file:', err);
      toast.error('Failed to open resume PDF file from database.', { id: 'resume-load' });
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
    hours = hours % 12 || 12;
    const strHours = String(hours).padStart(2, '0');

    return `${day}/${month}/${year}, ${strHours}:${minutes} ${ampm}`;
  };

 const filteredResumes = resumes.filter((resume) => {
  if (!resume.createdAt) return false;

  const resumeDate = new Date(resume.createdAt);

  if (isNaN(resumeDate.getTime())) return false;

  // MONTH FILTER
  if (selectedMonth) {
    const year = resumeDate.getFullYear();

    const month = String(
      resumeDate.getMonth() + 1
    ).padStart(2, '0');

    const resumeMonth = `${year}-${month}`;

    if (resumeMonth !== selectedMonth) {
      return false;
    }
  }

  // FROM DATE FILTER
  if (startDate) {
    const start = new Date(`${startDate}T00:00:00`);

    if (resumeDate < start) {
      return false;
    }
  }

  // TO DATE FILTER
  if (endDate) {
    const end = new Date(`${endDate}T23:59:59.999`);

    if (resumeDate > end) {
      return false;
    }
  }

  return true;
});


  const columns = [

    {
  title: '<span style="display:block; width:70px; text-align:center;">S.No.</span>',
  data: 'serialNumber',
  orderable: false,
  searchable: false,
  render: (data) => `
    <span style="
      display:block;
      width:70px;
      text-align:center;
    ">
      ${data}.
    </span>
  `
},

    {
      title: 'Student Name',
      data: 'name',
      render: (_data, _type, row) => {
        const name = row.name || row.student_name || row.userId?.fullName || row.userId?.name || 'Student';
        const targetId = row.userId?._id || (typeof row.userId === 'string' ? row.userId : null) || row.studentId || row.student_id;
        return `
          <a href="#" class="view-student-profile text-decoration-none fw-bold" style="color: #6D28D9;" data-id="${targetId || ''}" title="Click to view full student profile">
            ${name}
          </a>
        `;
      }
    },
    {
      title: 'Student ID',
      data: 'studentId',
      render: (data) => {
        const studentId = data || 'N/A';
        return `<span class="small fw-medium text-danger text-nowrap">${studentId}</span>`;
      }
    },
    {
      title: 'File Name',
      data: 'fileName',
      render: (data, _type, row) => {
        const name = data || row.resume_file?.fileName || 'Resume.pdf';
        const id = row._id || row.id;
        return `<a href="#" class="view-resume-btn fw-bold text-purple text-decoration-none d-inline-flex align-items-center gap-1" style="text-decoration: none !important;" data-id="${id}" data-name="${name}" title="Click to view resume in new tab">
          📄 ${name}
        </a>`;
      }
    },
    {
      title: 'Format',
      data: 'contentType',
      render: (data) => `<span class="badge bg-secondary">${data || 'application/pdf'}</span>`
    },
    {
      title: 'Upload Date',
      data: 'createdAt',
      render: (data, _type, row) => {
        const val = data || row.uploadedAt;
        return `<span class="text-nowrap font-monospace small">${formatDateTime(val)}</span>`;
      }
    },
    {
      title: 'ATS Status',
      data: 'status',
      render: () => `<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-20">Parsed</span>`
    }
  ];

  if (selectedStudentId) {
    return (
      <div className="p-3.5">
        <SuperAdminStudentProfileView
          studentId={selectedStudentId}
          onBack={() => setSelectedStudentId(null)}
          backTitle="Back to Resume Records"
        />
      </div>
    );
  }

  return (
    <div className="p-3.5">
      <div className="card border-0 shadow-sm p-3 mb-3 rounded-3 text-white" style={{ background: '#4C1D95' }}>
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <FaFileAlt className="text-white" size={22} />
            <h5 className="fw-bold mb-0 text-white">Resume Records ({resumes.length})</h5>
          </div>
          <span className="badge rounded-pill px-3 py-1" style={{ background: '#8B5CF6', color: '#FFFFFF' }}>
            ATS Resume Analysis Logs
          </span>
        </div>
      </div>

      {/* ================= RESUME DATE FILTER ================= */}
<div className="card border-0 shadow-sm mb-3 rounded-3">
  <div className="card-body py-3">

    <div className="row g-3 align-items-end">

      {/* Search by Month */}
      <div className="col-md-3">
        <label className="form-label fw-semibold">
          Search by Month
        </label>

        <input
          type="month"
          className="form-control"
          value={selectedMonth}
          onChange={(e) => {
            setSelectedMonth(e.target.value);

            // Clear date range
            setStartDate('');
            setEndDate('');
          }}
        />
      </div>


      {/* From Date */}
      <div className="col-md-3">
        <label className="form-label fw-semibold">
          From Date
        </label>

        <input
          type="date"
          className="form-control"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);

            // Clear month filter
            setSelectedMonth('');

            // Prevent invalid date range
            if (endDate && e.target.value > endDate) {
              setEndDate('');
            }
          }}
        />
      </div>


      {/* To Date */}
      <div className="col-md-3">
        <label className="form-label fw-semibold">
          To Date
        </label>

        <input
          type="date"
          className="form-control"
          value={endDate}
          min={startDate}
          onChange={(e) => {
            setEndDate(e.target.value);

            // Clear month filter
            setSelectedMonth('');
          }}
        />
      </div>


      {/* Clear Filters */}
      <div className="col-md-2">
        <button
          type="button"
          className="btn btn-outline-secondary w-100"
          onClick={() => {
            setSelectedMonth('');
            setStartDate('');
            setEndDate('');
          }}
        >
          Clear Filters
        </button>
      </div>


      {/* Resume Count */}
      <div className="col-md-1">
        <div className="text-muted small">
          Records
        </div>

        <div className="fw-bold fs-5 text-primary">
          {filteredResumes.length}
        </div>
      </div>

    </div>

  </div>
</div>

      <DataTable
        title="Student Resumes Master Table"
        columns={columns}
        data={filteredResumes}
        loading={loading}
        onResumeClick={handleViewResume}
        onStudentClick={(id) => setSelectedStudentId(id)}
      />
    </div>
  );
};

export default SuperAdminResumes;
