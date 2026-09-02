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

  useEffect(() => {
    fetchTargetJobs();
  }, []);

  const fetchTargetJobs = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/target-jobs');
      if (res.data && res.data.success) {
        setTargetJobs(res.data.targetJobs || []);
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

  // Column Order: Student ID → Student Name → Target Job Role → Target Company → Experience Level → Job Type → Created Date
  const columns = [
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

      <DataTable
        title="Target Jobs Master Table"
        columns={columns}
        data={targetJobs}
        loading={loading}
        onStudentClick={(id) => setSelectedStudentId(id)}
      />
    </div>
  );
};

export default SuperAdminTargetJobs;
