import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { FaUserPlus, FaPaperPlane } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import DataTable from './components/DataTable';
import SuperAdminStudentProfileView from './components/SuperAdminStudentProfileView';

const SuperAdminRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [sendingNotification, setSendingNotification] = useState(false);

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

  const handleSelectStudent = (studentId) => {
    const targetId = String(studentId);
    setSelectedStudentIds((previousIds) => {
      const stringIds = previousIds.map(String);
      if (stringIds.includes(targetId)) {
        return stringIds.filter((id) => id !== targetId);
      }
      return [...stringIds, targetId];
    });
  };

  const handleSelectAll = () => {
    const registeredStudentIds = filteredRegistrations
      .filter((student) => student.isActive !== false)
      .map((student) => String(student._id));

    const currentStringIds = selectedStudentIds.map(String);

    const allSelected =
      registeredStudentIds.length > 0 &&
      registeredStudentIds.every((id) => currentStringIds.includes(id));

    if (allSelected) {
      setSelectedStudentIds((previousIds) =>
        previousIds.map(String).filter((id) => !registeredStudentIds.includes(id))
      );
    } else {
      setSelectedStudentIds((previousIds) => [
        ...new Set([...previousIds.map(String), ...registeredStudentIds])
      ]);
    }
  };

  const handleSendBulkEmail = async () => {
    if (selectedStudentIds.length === 0) {
      toast.error('Please select at least one registered student to send a message.');
      return;
    }

    const { value: formValues } = await Swal.fire({
      title: `<span style="color:#4C1D95; font-weight:700;">Send Direct Email Notification</span>`,
      html: `
        <p class="text-muted small mb-3">Sending direct email to <strong>${selectedStudentIds.length}</strong> selected registered student(s).</p>
        <div style="text-align:left;">
          <label style="font-weight:600; font-size:0.875rem; margin-bottom:4px; display:block;">Email Subject</label>
          <input id="swal-subject" class="swal2-input" style="width:100%; margin:0 0 14px 0; font-size:0.9rem;" value="Your Interview Journey Starts Here! 🚀" placeholder="Enter email subject..." />
          
          <label style="font-weight:600; font-size:0.875rem; margin-bottom:4px; display:block;">Email Message</label>
          <textarea id="swal-message" class="swal2-textarea" style="width:100%; margin:0; font-size:0.9rem; min-height:100px;" placeholder="Enter email message content...">Get access to AI-powered mock interviews, personalized feedback & performance tracking. Upgrade now and prepare smarter for your next interview.</textarea>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: '#6D28D9',
      cancelButtonColor: '#6B7280',
      confirmButtonText: `Send Email Directly (${selectedStudentIds.length})`,
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const subject = document.getElementById('swal-subject').value.trim();
        const message = document.getElementById('swal-message').value.trim();
        if (!subject || !message) {
          Swal.showValidationMessage('Please provide both subject and message.');
          return false;
        }
        return { subject, message };
      }
    });

    if (!formValues) return;

    try {
      setSendingNotification(true);
      const res = await API.post('/notifications/send', {
        studentIds: selectedStudentIds,
        subject: formValues.subject,
        message: formValues.message
      });

      if (res.data && res.data.success) {
        Swal.fire({
          title: 'Email Sent!',
          text: res.data.message || `Notification email sent successfully to ${res.data.successCount || selectedStudentIds.length} student(s).`,
          icon: 'success',
          confirmButtonColor: '#6D28D9'
        });
        setSelectedStudentIds([]);
      } else {
        toast.error(res.data?.message || 'Failed to send notifications.');
      }
    } catch (err) {
      console.error('Send Notification Error:', err);
      toast.error(err.response?.data?.message || 'Failed to send notification email to selected students.');
    } finally {
      setSendingNotification(false);
    }
  };

  const registeredInFiltered = filteredRegistrations.filter((s) => s.isActive !== false);
  const currentSelectedStr = selectedStudentIds.map(String);
  const isAllSelected =
    registeredInFiltered.length > 0 &&
    registeredInFiltered.every((s) => currentSelectedStr.includes(String(s._id)));

  const columns = [
    {
      title: `
        <div style="text-align:center;">
          <input
            type="checkbox"
            id="select-all-students"
            class="select-all-students-checkbox"
            ${isAllSelected ? 'checked' : ''}
          />
        </div>
      `,
      data: null,
      orderable: false,
      searchable: false,
      render: (_data, _type, row) => {
        // Only registered/active students can receive email
        if (row.isActive === false) {
          return '';
        }

        const isChecked = currentSelectedStr.includes(String(row._id));

        return `
          <div style="text-align:center;">
            <input
              type="checkbox"
              class="student-notification-checkbox"
              data-id="${String(row._id)}"
              ${isChecked ? 'checked' : ''}
            />
          </div>
        `;
      }
    },
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
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <FaUserPlus className="text-white" size={22} />
            <h5 className="fw-bold mb-0 text-white">Registration Records ({registrations.length})</h5>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-light fw-bold d-flex align-items-center gap-2 px-3 py-1.5 rounded-pill shadow-sm"
              style={{ color: '#4C1D95', opacity: selectedStudentIds.length === 0 ? 0.7 : 1 }}
              disabled={selectedStudentIds.length === 0 || sendingNotification}
              onClick={handleSendBulkEmail}
            >
              {sendingNotification ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Sending...
                </>
              ) : (
                <>
                  <FaPaperPlane size={14} style={{ color: '#4C1D95' }} />
                  Send Message {selectedStudentIds.length > 0 && `(${selectedStudentIds.length})`}
                </>
              )}
            </button>
            <span className="badge rounded-pill px-3 py-1" style={{ background: '#8B5CF6', color: '#FFFFFF' }}>
              Live Registration Accounts
            </span>
          </div>
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
        selectedStudentIds={selectedStudentIds}
        onStudentSelect={handleSelectStudent}
        onSelectAllStudents={handleSelectAll}
      />
    </div>
  );
};

export default SuperAdminRegistrations;
