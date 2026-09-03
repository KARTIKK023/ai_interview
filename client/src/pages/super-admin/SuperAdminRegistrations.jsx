import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { FaUserPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';
import DataTable from './components/DataTable';
import SuperAdminStudentProfileView from './components/SuperAdminStudentProfileView';

const SuperAdminRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [selectedMonth, setSelectedMonth] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/registrations');
      if (res.data && res.data.success) {

        const registrationsWithSerialNumber = (
        res.data.registrations || []
      ).map((registration, index) => ({
        ...registration,
        serialNumber: index + 1
      }));
        setRegistrations(registrationsWithSerialNumber);
      }
    } catch (err) {
      console.error('Failed to load registrations:', err);
      toast.error('Failed to fetch registration records from database.');
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

 const filteredRegistrations = registrations.filter((registration) => {
  if (!registration.createdAt) return false;

  const registrationDate = new Date(registration.createdAt);

  if (isNaN(registrationDate.getTime())) return false;

  // MONTH FILTER
  if (selectedMonth) {
    const year = registrationDate.getFullYear();

    const month = String(
      registrationDate.getMonth() + 1
    ).padStart(2, '0');

    const registrationMonth = `${year}-${month}`;

    if (registrationMonth !== selectedMonth) {
      return false;
    }
  }

  // FROM DATE FILTER
  if (startDate) {
    const start = new Date(`${startDate}T00:00:00`);

    if (registrationDate < start) {
      return false;
    }
  }

  // TO DATE FILTER
  if (endDate) {
    const end = new Date(`${endDate}T23:59:59.999`);

    if (registrationDate > end) {
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
      title: 'User Name',
      data: 'fullName',
      render: (_data, _type, row) => {
        const name = row.fullName || row.name || 'User';
        return `
          <a href="#" class="view-student-profile text-decoration-none fw-bold" style="color: #6D28D9;" data-id="${row._id}" title="Click to view full user profile">
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
      title: 'Student ID',
      data: 'studentId',
      render: (data) => {
        const studentId = data || 'N/A';
        return `<span class="small fw-medium text-danger text-nowrap">${studentId}</span>`;
      }
    },
    {
      title: 'Password',
      data: 'password',
      render: () => `<span class="badge bg-light text-secondary border fw-medium">•••••••• (Protected)</span>`
    },
    {
      title: 'Account Role',
      data: 'role',
      render: (data) => {
        const role = (data || 'STUDENT').toUpperCase();
        const badgeClass = role === 'SUPER_ADMIN' ? 'bg-danger' : (role === 'HR' || role === 'ADMIN') ? 'bg-purple' : 'bg-primary';
        return `<span class="badge ${badgeClass} text-uppercase">${role}</span>`;
      }
    },
    {
      title: 'Registration Date',
      data: 'createdAt',
      render: (data) => `<span class="text-nowrap font-monospace small">${formatDateTime(data)}</span>`
    },
    {
      title: 'Status',
      data: 'isActive',
      render: () => `<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-20">Registered</span>`
    }
  ];

  if (selectedUserId) {
    return (
      <div className="p-3.5">
        <SuperAdminStudentProfileView
          studentId={selectedUserId}
          onBack={() => setSelectedUserId(null)}
          backTitle="Back to Registration Records"
        />
      </div>
    );
  }

  return (
    <div className="p-3.5">
      <div className="card border-0 shadow-sm p-3 mb-3 rounded-3 text-white" style={{ background: '#4C1D95' }}>
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <FaUserPlus className="text-white" size={22} />
            <h5 className="fw-bold mb-0 text-white">Registration Records ({registrations.length})</h5>
          </div>
          <span className="badge rounded-pill px-3 py-1" style={{ background: '#8B5CF6', color: '#FFFFFF' }}>
            Live Registration Accounts
          </span>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-3 rounded-3">
  <div className="card-body py-3">

    <div className="row g-3 align-items-end">

      {/* Month-wise Filter */}
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

            // Prevent invalid range
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


      {/* Clear Button */}
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


      {/* Records Count */}
      <div className="col-md-1">
        <div className="text-muted small">
          Records
        </div>

        <div className="fw-bold fs-5 text-primary">
          {filteredRegistrations.length}
        </div>
      </div>

    </div>

  </div>
</div>

      <DataTable
        title="Account Registrations Master Table"
        columns={columns}
        data={filteredRegistrations}
        loading={loading}
        onStudentClick={(id) => setSelectedUserId(id)}
      />
    </div>
  );
};

export default SuperAdminRegistrations;
