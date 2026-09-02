import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { FaUserGraduate } from 'react-icons/fa';
import toast from 'react-hot-toast';
import DataTable from './components/DataTable';
import SuperAdminStudentProfileView from './components/SuperAdminStudentProfileView';

const SuperAdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/students');
      if (res.data && res.data.success) {
        setStudents(res.data.students || []);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
      toast.error('Failed to fetch student records from database.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (studentId, currentStatus) => {
    const isCurrentlyInactive = (currentStatus || '').toLowerCase().includes('inactive');
    const nextStatus = isCurrentlyInactive ? 'Active' : 'Services Inactive';
    try {
      toast.loading(`Updating service access status in MongoDB...`, { id: 'status-update' });
      const res = await API.put(`/admin/students/${studentId}/service-status`, { serviceStatus: nextStatus });
      if (res.data && res.data.success) {
        toast.success(`Service access set to ${nextStatus}`, { id: 'status-update' });
        setStudents(prev => prev.map(s => (s._id === studentId ? { ...s, serviceStatus: nextStatus } : s)));
      }
    } catch (err) {
      console.error('Failed to update service status:', err);
      toast.error('Failed to update service status in database.', { id: 'status-update' });
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

  const columns = [
    {
      title: 'Student Name',
      data: 'fullName',
      render: (_data, _type, row) => {
        const name = row.fullName || row.name || 'Student';
        return `
          <a href="#" class="view-student-profile text-decoration-none fw-bold" style="color: #6D28D9;" data-id="${row._id}" title="Click to view full student profile">
            ${name}
          </a>
        `;
      }
    },
    {
      title: 'Email Address',
      data: 'email'
    },
    {
      title: 'Phone Number',
      data: 'mobileNumber',
      render: (_data, _type, row) => {
        const phone = row.mobileNumber || row.profile?.phone || row.phone || row.phoneNumber;
        return phone ? `<span class="fw-medium text-dark">${phone}</span>` : '<span class="text-muted">N/A</span>';
      }
    },
    {
      title: 'Role',
      data: 'role',
      render: (data) => `<span class="badge bg-primary text-uppercase">${data || 'STUDENT'}</span>`
    },
    {
      title: 'Student ID',
      data: 'studentId',
      render: (data, _type, row) => {
        const studentId = data || (row._id ? row._id.substring(0, 8) : 'N/A');
        return `<span class="small fw-medium text-danger text-nowrap">${studentId}</span>`;
      }
    },
    {
      title: 'Registration Date',
      data: 'createdAt',
      render: (data) => `<span class="text-nowrap font-monospace small">${formatDateTime(data)}</span>`
    },
    {
      title: 'Status',
      data: 'serviceStatus',
      render: (data, _type, row) => {
        const statusVal = data || row.serviceStatus || 'Active';
        const isInactive = (statusVal).toLowerCase().includes('inactive');
        const displayText = isInactive ? 'Services Inactive' : 'Active';
        const badgeClass = isInactive
          ? 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-20'
          : 'bg-success bg-opacity-10 text-success border border-success border-opacity-20';
        return `
          <span class="badge ${badgeClass} toggle-status-btn cursor-pointer" data-id="${row._id}" data-status="${statusVal}" title="Click to toggle HireSmart AI service access">
            ${displayText}
          </span>
        `;
      }
    }
  ];

  if (selectedStudentId) {
    return (
      <div className="p-3.5">
        <SuperAdminStudentProfileView
          studentId={selectedStudentId}
          onBack={() => setSelectedStudentId(null)}
          backTitle="Back to Students Records"
        />
      </div>
    );
  }

  return (
    <div className="p-3.5">
      <div className="card border-0 shadow-sm p-3 mb-3 rounded-3 text-white" style={{ background: '#4C1D95' }}>
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <FaUserGraduate className="text-white" size={22} />
            <h5 className="fw-bold mb-0 text-white">Students Records ({students.length})</h5>
          </div>
          <span className="badge rounded-pill px-3 py-1" style={{ background: '#8B5CF6', color: '#FFFFFF' }}>
            Live MongoDB Sync
          </span>
        </div>
      </div>

      <DataTable
        title="Students Master Table"
        columns={columns}
        data={students}
        loading={loading}
        onStudentClick={(id) => setSelectedStudentId(id)}
        onStatusToggle={handleStatusToggle}
      />
    </div>
  );
};

export default SuperAdminStudents;
