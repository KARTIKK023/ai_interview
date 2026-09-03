import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { FaBriefcase } from 'react-icons/fa';
import toast from 'react-hot-toast';
import DataTable from './components/DataTable';
import SuperAdminStudentProfileView from './components/SuperAdminStudentProfileView';

const SuperAdminTargetJobs = () => {
  const [targetJobs, setTargetJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const [selectedMonth, setSelectedMonth] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchTargetJobs();
  }, []);

  const fetchTargetJobs = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/target-jobs');
      if (res.data && res.data.success) {
      const targetJobsWithSerialNumber = (res.data.targetJobs || []).map(
      (targetJob, index) => ({
      ...targetJob,
      serialNumber: index + 1
    })
  );

  setTargetJobs(targetJobsWithSerialNumber);
}
    } catch (err) {
      console.error('Failed to load target jobs:', err);
      toast.error('Failed to fetch target job records from database.');
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
    hours = hours % 12 || 12;
    const strHours = String(hours).padStart(2, '0');

    return `${day}/${month}/${year}, ${strHours}:${minutes} ${ampm}`;
  };
  
  const filteredTargetJobs = targetJobs.filter((targetJob) => {
  if (!targetJob.createdAt) return false;

  const targetJobDate = new Date(targetJob.createdAt);

  if (isNaN(targetJobDate.getTime())) return false;

  // MONTH FILTER
  if (selectedMonth) {
    const year = targetJobDate.getFullYear();

    const month = String(
      targetJobDate.getMonth() + 1
    ).padStart(2, '0');

    const targetJobMonth = `${year}-${month}`;

    if (targetJobMonth !== selectedMonth) {
      return false;
    }
  }

  // FROM DATE FILTER
  if (startDate) {
    const start = new Date(`${startDate}T00:00:00`);

    if (targetJobDate < start) {
      return false;
    }
  }

  // TO DATE FILTER
  if (endDate) {
    const end = new Date(`${endDate}T23:59:59.999`);

    if (targetJobDate > end) {
      return false;
    }
  }

  return true;
});


  // Column Order: Student ID → Student Name → Target Job Role → Target Company → Experience Level → Job Type → Created Date
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
      title: 'Student ID',
      data: 'student_id',
      render: (data, _type, row) => `<code>${data || (row._id ? row._id.substring(0, 8) : 'N/A')}</code>`
    },
    {
      title: 'Student Name',
      data: 'studentName',
      render: (data, _type, row) => {
        const name = data || row.studentName || row.name || row.fullName || 'Student';
        const targetId = row.studentUserId || row.student_id || row.studentId || row._id;
        return `
          <a href="#" class="view-student-profile text-decoration-none fw-bold" style="color: #6D28D9;" data-id="${targetId || ''}" title="Click to view full student profile">
            ${name}
          </a>
        `;
      }
    },
    {
      title: 'Target Job Role',
      data: 'target_job_role',
      render: (data) => `<strong class="text-dark">${data || 'Software Engineer'}</strong>`
    },
    {
      title: 'Target Company',
      data: 'target_company',
      render: (data) => data || 'Any Industry'
    },
    {
      title: 'Experience Level',
      data: 'experience',
      render: (data) => `<span class="badge bg-secondary">${data || 'Fresher'}</span>`
    },
    {
      title: 'Job Type',
      data: 'job_type',
      render: (data) => `<span class="badge bg-info">${data || 'Full Time'}</span>`
    },
    {
      title: 'Created Date',
      data: 'createdAt',
      render: (data) => `<span class="text-nowrap font-monospace small">${formatDateTime(data)}</span>`
    }
  ];

  if (selectedStudentId) {
    return (
      <div className="p-3.5">
        <SuperAdminStudentProfileView
          studentId={selectedStudentId}
          onBack={() => setSelectedStudentId(null)}
          backTitle="Back to Target Jobs Records"
        />
      </div>
    );
  }

  return (
    <div className="p-3.5">
      <div className="card border-0 shadow-sm p-3 mb-3 rounded-3 text-white" style={{ background: '#4C1D95' }}>
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <FaBriefcase className="text-white" size={22} />
            <h5 className="fw-bold mb-0 text-white">Target Jobs Records ({targetJobs.length})</h5>
          </div>
          <span className="badge rounded-pill px-3 py-1" style={{ background: '#8B5CF6', color: '#FFFFFF' }}>
            Candidate Preferred Roles
          </span>
        </div>
      </div>

      {/* ================= TARGET JOBS DATE FILTER ================= */}
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


      {/* Target Jobs Count */}
      <div className="col-md-1">
        <div className="text-muted small">
          Records
        </div>

        <div className="fw-bold fs-5 text-primary">
          {filteredTargetJobs.length}
        </div>
      </div>

    </div>

  </div>
</div>

      <DataTable
        title="Target Jobs Master Table"
        columns={columns}
        data={filteredTargetJobs}
        loading={loading}
        onStudentClick={(id) => setSelectedStudentId(id)}
      />
    </div>
  );
};

export default SuperAdminTargetJobs;
