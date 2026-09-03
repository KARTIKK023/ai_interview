import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';
import API from '../../services/api';
import DataTable from '../super-admin/components/DataTable';
import { FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const StudentInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterviewToDelete, setSelectedInterviewToDelete] =
    useState(null);
  const [deleting, setDeleting] = useState(false);

  // ============================================================
  // FETCH INTERVIEWS
  // ============================================================

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);

      const res = await API.get('/interviews');

      setInterviews(res.data?.interviews || []);
    } catch (err) {
      console.error('Failed to fetch interviews:', err);

      toast.error(
        err.response?.data?.message ||
          'Failed to load interviews.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // SOURCE LOGIC
  // ============================================================

  const getInterviewSource = (interview) => {
    /*
      5 minute interview has priority.

      Example:
      duration = 5
      total_questions = 20

      Source = 5 min
      NOT L3
    */

    if (Number(interview?.duration) === 5) {
      return '5 min';
    }

    const levelMap = {
      10: 'L1',
      15: 'L2',
      20: 'L3',
      25: 'L4',
      30: 'L5',
      35: 'L6',
      40: 'L7',
      45: 'L8',
      50: 'L9',
      55: 'L10',
    };

    return levelMap[Number(interview?.total_questions)] || 'N/A';
  };

  // ============================================================
  // DELETE
  // ============================================================

  const confirmDeleteInterview = async () => {
    if (!selectedInterviewToDelete) {
      return;
    }

    try {
      setDeleting(true);

      await API.delete(
        `/interviews/${selectedInterviewToDelete}`
      );

      setInterviews((previousInterviews) =>
        previousInterviews.filter(
          (item) =>
            item._id !== selectedInterviewToDelete
        )
      );

      toast.success(
        'Interview session deleted successfully'
      );

      setSelectedInterviewToDelete(null);
    } catch (err) {
      console.error('Failed to delete interview:', err);

      toast.error(
        err.response?.data?.message ||
          'Failed to delete interview. Please try again.'
      );
    } finally {
      setDeleting(false);
    }
  };

  // ============================================================
  // HANDLE TABLE CLICK
  // ============================================================

  const handleTableClick = (event) => {
    const deleteButton = event.target.closest(
      '.delete-interview-btn'
    );

    if (!deleteButton) {
      return;
    }

    const interviewId =
      deleteButton.getAttribute('data-id');

    if (interviewId) {
      setSelectedInterviewToDelete(interviewId);
    }
  };

  // ============================================================
  // TABLE COLUMNS
  // ============================================================

  const columns = [
    // ----------------------------------------------------------
    // STUDENT
    // ----------------------------------------------------------

    {
      title: 'Student',
      data: 'candidateId',

      render: (candidateId, type, row) => {
        const studentName =
          candidateId?.fullName ||
          candidateId?.name ||
          'Student';

        const studentId =
          candidateId?.studentId ||
          candidateId?.student_id ||
          row?.student_id ||
          '';

        return `
          <div>
            <div class="fw-bold text-dark">
              ${studentName}
            </div>

            ${
              studentId
                ? `
                  <small class="text-muted extra-small font-monospace">
                    ${studentId}
                  </small>
                `
                : ''
            }
          </div>
        `;
      },
    },

    // ----------------------------------------------------------
    // JOB ROLE
    // ----------------------------------------------------------

    {
      title: 'Job Role',
      data: 'jobRole',

      render: (data) => `
        <span class="fw-bold text-dark">
          ${data || 'N/A'}
        </span>
      `,
    },

    // ----------------------------------------------------------
    // CATEGORY
    // ----------------------------------------------------------

    {
      title: 'Category',
      data: 'category',

      render: (data) => {
        const isTechnical = data === 'Technical';

        return `
          <span
            class="badge px-2.5 py-1"
            style="
              background-color: ${
                isTechnical
                  ? '#eff6ff'
                  : '#f8fafc'
              };
              color: ${
                isTechnical
                  ? '#2563eb'
                  : '#475569'
              };
              border: 1px solid ${
                isTechnical
                  ? '#bfdbfe'
                  : '#e2e8f0'
              };
            "
          >
            ${data || 'N/A'}
          </span>
        `;
      },
    },

    // ----------------------------------------------------------
    // PURPOSE
    // ----------------------------------------------------------

    {
      title: 'Purpose',
      data: 'purpose',

      render: (data) => {
        const isRecruitment =
          data === 'Recruitment';

        return `
          <span
            class="badge ${
              isRecruitment
                ? 'bg-danger bg-opacity-10 text-danger border border-danger-subtle'
                : 'bg-secondary bg-opacity-10 text-secondary border border-secondary-subtle'
            }"
          >
            ${data || 'Practice'}
          </span>
        `;
      },
    },

    // ----------------------------------------------------------
    // MODE
    // ----------------------------------------------------------

    {
      title: 'Mode',
      data: 'mode',

      render: (data) => {
        const isVideo = data === 'Video';

        return `
          <span
            class="badge px-2.5 py-1"
            style="
              background-color: ${
                isVideo
                  ? '#fff1f2'
                  : '#ecfeff'
              };
              color: ${
                isVideo
                  ? '#e11d48'
                  : '#0891b2'
              };
              border: 1px solid ${
                isVideo
                  ? '#fecdd3'
                  : '#a5f3fc'
              };
            "
          >
            ${data || 'Text'}
          </span>
        `;
      },
    },

    // ----------------------------------------------------------
    // SOURCE - NEW
    // ----------------------------------------------------------

    {
      title: 'Source',
      data: 'total_questions',

      render: (data, type, row) => {
        const source = getInterviewSource(row);

        const isFiveMinute =
          source === '5 min';

        return `
          <span
            class="badge px-2.5 py-1"
            style="
              background-color: ${
                isFiveMinute
                  ? '#fff7ed'
                  : '#f5f3ff'
              };
              color: ${
                isFiveMinute
                  ? '#c2410c'
                  : '#6d28d9'
              };
              border: 1px solid ${
                isFiveMinute
                  ? '#fed7aa'
                  : '#ddd6fe'
              };
              font-weight: 700;
            "
          >
            ${source}
          </span>
        `;
      },
    },

    // ----------------------------------------------------------
    // SCORE
    // ----------------------------------------------------------

    {
      title: 'Score',
      data: 'percentage',

      render: (data, type, row) => {
        if (row?.status !== 'Completed') {
          return `
            <span class="text-muted">
              -
            </span>
          `;
        }

        const percentage =
          row?.percentage ??
          row?.score ??
          0;

        return `
          <span class="fw-bold text-success">
            ${percentage}%
          </span>
        `;
      },
    },

    // ----------------------------------------------------------
    // STATUS
    // ----------------------------------------------------------

    {
      title: 'Status',
      data: 'status',

      render: (data) => {
        let statusClass =
          'bg-primary bg-opacity-10 text-primary border border-primary-subtle';

        if (data === 'Completed') {
          statusClass =
            'bg-success bg-opacity-10 text-success border border-success-subtle';
        } else if (data === 'Stopped') {
          statusClass =
            'bg-warning bg-opacity-10 text-warning border border-warning-subtle';
        } else if (data === 'Expired') {
          statusClass =
            'bg-danger bg-opacity-10 text-danger border border-danger-subtle';
        } else if (data === 'Pending') {
          statusClass =
            'bg-info bg-opacity-10 text-info border border-info-subtle';
        }

        return `
          <span class="badge ${statusClass}">
            ${data || 'Pending'}
          </span>
        `;
      },
    },

    // ----------------------------------------------------------
    // DATE
    // ----------------------------------------------------------

    {
      title: 'Date',
      data: 'createdAt',

      render: (data) => {
        if (!data) {
          return 'N/A';
        }

        const date = new Date(data);

        if (Number.isNaN(date.getTime())) {
          return 'N/A';
        }

        return date.toLocaleDateString();
      },
    },

    // ----------------------------------------------------------
    // ACTIONS
    // ----------------------------------------------------------

    {
      title: 'Actions',
      data: '_id',
      orderable: false,
      searchable: false,

      render: (id, type, row) => {
        if (!id) {
          return '';
        }

        // COMPLETED
        if (row?.status === 'Completed') {
          return `
            <div class="d-flex align-items-center gap-2">

              <a
                href="/student/result/${id}"
                class="btn btn-sm fw-semibold view-report-btn"
                style="
                  background-color: #eff6ff;
                  color: #2563eb;
                  border: 1px solid #bfdbfe;
                  border-radius: 6px;
                  text-decoration: none;
                "
              >
                View Report
              </a>

              <button
                type="button"
                class="btn btn-outline-danger btn-sm delete-interview-btn"
                data-id="${id}"
                title="Delete Interview Session"
              >
                <i class="fa fa-trash"></i>
                Delete
              </button>

            </div>
          `;
        }

        // INCOMPLETE
        const interviewUrl =
          row?.mode === 'Video'
            ? `/student/interview-video/${id}`
            : `/student/interview-text/${id}`;

        return `
          <div class="d-flex align-items-center gap-2">

            <a
              href="${interviewUrl}"
              class="
                btn
                btn-sm
                fw-bold
                text-white
                view-resume-btn
              "
              style="
                background-color: #2563eb;
                border-color: #2563eb;
                border-radius: 6px;
                text-decoration: none;
              "
            >
              Continue
            </a>

            <button
              type="button"
              class="btn btn-outline-danger btn-sm delete-interview-btn"
              data-id="${id}"
              title="Delete Interview Session"
            >
              <i class="fa fa-trash"></i>
              Delete
            </button>

          </div>
        `;
      },
    },
  ];

  // ============================================================
  // DATATABLE OPTIONS
  // ============================================================

  const tableOptions = {
    paging: true,
    pageLength: 10,
    lengthMenu: [10, 25, 50, 100],

    searching: true,
    ordering: true,
    responsive: true,
    autoWidth: false,
    destroy: true,

    language: {
      search: '',
      searchPlaceholder: 'Search interviews...',
      lengthMenu: 'Show _MENU_',
      info:
        'Showing _START_ to _END_ of _TOTAL_ interviews',
      emptyTable:
        'No interviews found in your history.',
      zeroRecords:
        'No matching interviews found.',
    },

    columnDefs: [
      {
        targets: '_all',
        className: 'align-middle',
      },
    ],
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <StudentLayout>

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h3 className="fw-extrabold mb-1">
            My Interview History
          </h3>

          <p className="text-muted small mb-0">
            Track and manage all your AI practice sessions
            and HR recruitment interviews
          </p>
        </div>

        <div className="d-flex gap-2">

          <Link
            to="/student/interview-preparation/ai-mock"
            className="btn btn-primary-custom"
          >
            Start New Practice
          </Link>

          <Link
            to="/student/interview-preparation/quick-practice"
            className="btn btn-primary-custom"
          >
            Quick 5-Min Practice
          </Link>

        </div>
      </div>

      {/* ======================================================
          TABLE CARD
      ====================================================== */}

      <div className="card card-custom p-4 shadow-sm flex-grow-1">

        <div
          className="custom-datatable-wrapper table-responsive p-1"
          onClick={handleTableClick}
        >

          <DataTable
            title="Interview History"
            data={interviews}
            columns={columns}
            loading={loading}
            options={tableOptions}
            className="table table-hover align-middle mb-0 w-100"
          />

        </div>

      </div>

      {/* ======================================================
          DELETE CONFIRMATION MODAL
      ====================================================== */}

      {selectedInterviewToDelete && (
        <div
          className="
            modal
            show
            d-block
            bg-dark
            bg-opacity-50
          "
          tabIndex="-1"
          role="dialog"
          style={{ zIndex: 1050 }}
        >

          <div
            className="
              modal-dialog
              modal-dialog-centered
            "
            role="document"
            style={{ maxWidth: '440px' }}
          >

            <div
              className="
                modal-content
                border-0
                shadow-lg
              "
              style={{
                borderRadius: '16px',
              }}
            >

              <div className="modal-body p-4 text-center">

                {/* ICON */}

                <div
                  className="
                    d-inline-flex
                    align-items-center
                    justify-content-center
                    bg-danger
                    bg-opacity-10
                    text-danger
                    rounded-circle
                    p-3
                    mb-3
                  "
                  style={{
                    width: '64px',
                    height: '64px',
                  }}
                >
                  <FaTrash className="fs-3" />
                </div>

                {/* TITLE */}

                <h5 className="fw-extrabold text-dark mb-2">
                  Delete Interview History?
                </h5>

                {/* DESCRIPTION */}

                <p className="text-muted small mb-1">
                  Are you sure you want to delete this
                  interview session from your history?
                </p>

                <p className="text-danger extra-small fw-semibold mb-4">
                  This action cannot be undone.
                </p>

                {/* BUTTONS */}

                <div className="d-flex justify-content-center gap-3">

                  <button
                    type="button"
                    className="
                      btn
                      btn-outline-secondary
                      px-4
                      py-2
                      fw-bold
                      rounded-3
                    "
                    onClick={() =>
                      setSelectedInterviewToDelete(null)
                    }
                    disabled={deleting}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="
                      btn
                      btn-danger
                      px-4
                      py-2
                      fw-bold
                      rounded-3
                      d-flex
                      align-items-center
                      gap-2
                    "
                    onClick={confirmDeleteInterview}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <FaTrash />
                        Delete
                      </>
                    )}
                  </button>

                </div>

              </div>
            </div>
          </div>
        </div>
      )}

     

     

    </StudentLayout>
  );
};

export default StudentInterviews;