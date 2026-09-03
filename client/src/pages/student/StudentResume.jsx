import React, { useContext, useState, useEffect } from 'react';
import StudentLayout from '../../components/StudentLayout';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import toast from 'react-hot-toast';
import {
  FaFilePdf,
  FaEdit,
  FaTrash,
  FaUpload,
  FaDownload,
  FaTimes,
} from 'react-icons/fa';

const StudentResume = () => {
  const { user } = useContext(AuthContext);

  const [studentName, setStudentName] = useState(
    user?.fullName || user?.name || ''
  );

  const [selectedFile, setSelectedFile] = useState(null);
  const [resume, setResume] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // --------------------------------------------------
  // FETCH RESUME
  // --------------------------------------------------

  useEffect(() => {
    fetchMyResume();
  }, []);

  const fetchMyResume = async () => {
    try {
      setLoading(true);

      const res = await API.get('/resume/my-resume');

      if (res.data && res.data.resume) {
        setResume(res.data.resume);
      } else {
        setResume(null);
      }
    } catch (err) {
      console.error('Error fetching resume:', err);

      toast.error(
        err.response?.data?.message ||
          'Failed to fetch resume details'
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // FILE CHANGE
  // --------------------------------------------------

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (
      file.type !== 'application/pdf' &&
      !file.name.toLowerCase().endsWith('.pdf')
    ) {
      toast.error('Only PDF files (.pdf) are allowed.');

      e.target.value = '';
      setSelectedFile(null);

      return;
    }

    // 10 MB validation
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB.');

      e.target.value = '';
      setSelectedFile(null);

      return;
    }

    setSelectedFile(file);
  };

  // --------------------------------------------------
  // RESET FORM
  // --------------------------------------------------

  const resetForm = () => {
    setStudentName(user?.fullName || user?.name || '');
    setSelectedFile(null);
    setIsEditing(false);
    setShowForm(false);

    const fileInput = document.getElementById('resumeFileInput');

    if (fileInput) {
      fileInput.value = '';
    }
  };

  // --------------------------------------------------
  // OPEN ADD FORM
  // --------------------------------------------------

  const openAddForm = () => {
    setIsEditing(false);
    setSelectedFile(null);
    setStudentName(user?.fullName || user?.name || '');
    setShowForm(true);
  };

  // --------------------------------------------------
  // SUBMIT NEW RESUME
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error('Please choose a PDF resume file to upload.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append('student_name', studentName);
      formData.append('resume', selectedFile);

      const res = await API.post('/resume/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        toast.success(
          res.data.message || 'Resume uploaded successfully'
        );

        setResume(res.data.resume);
        resetForm();
      }
    } catch (err) {
      console.error('Submit Resume Error:', err);

      toast.error(
        err.response?.data?.message ||
          'Failed to submit resume'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------------------------
  // START EDIT
  // --------------------------------------------------

  const startEdit = () => {
    if (!resume) return;

    setStudentName(
      resume.student_name ||
        user?.fullName ||
        user?.name ||
        ''
    );

    setSelectedFile(null);
    setIsEditing(true);
    setShowForm(true);
  };

  // --------------------------------------------------
  // CANCEL EDIT
  // --------------------------------------------------

  const cancelEdit = () => {
    resetForm();
  };

  // --------------------------------------------------
  // UPDATE RESUME
  // --------------------------------------------------

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!resume) return;

    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append('student_name', studentName);

      if (selectedFile) {
        formData.append('resume', selectedFile);
      }

      const res = await API.put(
        `/resume/${resume._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (res.data.success) {
        toast.success(
          res.data.message || 'Resume updated successfully'
        );

        setResume(res.data.resume);
        resetForm();
      }
    } catch (err) {
      console.error('Update Resume Error:', err);

      toast.error(
        err.response?.data?.message ||
          'Failed to update resume'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------------------------
  // DELETE RESUME
  // --------------------------------------------------

  const handleDelete = async () => {
    if (!resume) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete your resume?'
    );

    if (!confirmed) return;

    try {
      const res = await API.delete(
        `/resume/${resume._id}`
      );

      if (res.data.success) {
        toast.success(
          res.data.message || 'Resume deleted successfully'
        );

        setResume(null);
        setIsEditing(false);
        setSelectedFile(null);
        setShowForm(false);
      }
    } catch (err) {
      console.error('Delete Resume Error:', err);

      toast.error(
        err.response?.data?.message ||
          'Failed to delete resume'
      );
    }
  };

  // --------------------------------------------------
  // VIEW RESUME
  // --------------------------------------------------

  const handleViewResume = async (id) => {
    try {
      const token =
        localStorage.getItem('studentToken') ||
        localStorage.getItem('token');

      const response = await API.get(
        `/resume/file/${id}`,
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
          responseType: 'blob',
        }
      );

      // Check if server returned JSON error
      if (response.data.type === 'application/json') {
        const text = await response.data.text();
        const json = JSON.parse(text);

        toast.error(
          json.message || 'Failed to view resume'
        );

        return;
      }

      const blob = new Blob([response.data], {
        type: 'application/pdf',
      });

      const url = URL.createObjectURL(blob);

      window.open(url, '_blank');
    } catch (error) {
      console.error('View Resume Error:', error);

      let errorMsg = 'Failed to view resume';

      if (
        error.response &&
        error.response.data instanceof Blob
      ) {
        try {
          const text =
            await error.response.data.text();

          const json = JSON.parse(text);

          errorMsg = json.message || errorMsg;
        } catch (e) {}
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }

      toast.error(errorMsg);
    }
  };

  // --------------------------------------------------
  // DOWNLOAD RESUME
  // --------------------------------------------------

  const handleDownloadResume = async (resumeData) => {
    try {
      const token =
        localStorage.getItem('studentToken') ||
        localStorage.getItem('token');

      const response = await API.get(
        `/resume/file/${resumeData._id}`,
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
          responseType: 'blob',
        }
      );

      // Check if server returned JSON error
      if (response.data.type === 'application/json') {
        const text = await response.data.text();
        const json = JSON.parse(text);

        toast.error(
          json.message || 'Failed to download resume'
        );

        return;
      }

      const blob = new Blob([response.data], {
        type: 'application/pdf',
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');

      link.href = url;

      link.download =
        resumeData.resume_file?.fileName ||
        'resume.pdf';

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        'Download Resume Error:',
        error
      );

      let errorMsg = 'Failed to download resume';

      if (
        error.response &&
        error.response.data instanceof Blob
      ) {
        try {
          const text =
            await error.response.data.text();

          const json = JSON.parse(text);

          errorMsg = json.message || errorMsg;
        } catch (e) {}
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }

      toast.error(errorMsg);
    }
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <StudentLayout>
      <div className="container-fluid px-0">

        {/* ================================
            HEADER
        ================================= */}

        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between mb-4 gap-3">

          <div className="text-center text-md-start">
            <h3 className="fw-extrabold mb-1">
              MY RESUME
            </h3>

            <p className="text-muted small mb-0">
              Manage your resume for recruitment and AI interviews
            </p>
          </div>

          {!resume && (
            <button
              type="button"
              className="btn btn-primary px-4"
              onClick={openAddForm}
            >
              Add Resume
            </button>
          )}

          {resume && (
            <button
              type="button"
              className="btn btn-primary px-4"
              onClick={startEdit}
            >
              Edit Resume
            </button>
          )}
        </div>

        {/* ================================
            RESUME TABLE
        ================================= */}

        <div className="card card-custom bg-white shadow-sm border-0">

          <div className="card-body p-4">

            <div className="d-flex align-items-center justify-content-between mb-4">

              <div>
                <h5 className="fw-bold mb-1 text-primary">
                  MY RESUME
                </h5>

                <p className="text-muted small mb-0">
                  Your currently uploaded resume
                </p>
              </div>

              {resume && (
                <span className="badge bg-success-subtle text-success px-3 py-2">
                  Resume Uploaded
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
                  Loading your resume...
                </p>

              </div>

            ) : (

              <div className="table-responsive">

                <table className="table table-hover align-middle border mb-0">

                  <thead className="table-light">

                    <tr>
                      <th>Student Name</th>
                      <th>Resume</th>
                      <th>Uploaded</th>
                      <th className="text-end">
                        Actions
                      </th>
                    </tr>

                  </thead>

                  <tbody>

                    {resume ? (

                      <tr>

                        {/* Student Name */}

                        <td>
                          <div className="d-flex align-items-center gap-2">

                            <div
                              className="rounded-circle bg-danger-subtle d-flex align-items-center justify-content-center"
                              style={{
                                width: '40px',
                                height: '40px',
                              }}
                            >
                              <FaFilePdf className="text-danger" />
                            </div>

                            <div>
                              <div className="fw-semibold">
                                {resume.student_name ||
                                  studentName}
                              </div>

                              <div className="text-muted extra-small">
                                Student Resume
                              </div>
                            </div>

                          </div>
                        </td>

                        {/* Resume File */}

                        <td>

                          <div className="fw-semibold text-dark">
                            {resume.resume_file?.fileName ||
                              'resume.pdf'}
                          </div>

                          <div className="text-muted extra-small">
                            PDF Document
                          </div>

                        </td>

                        {/* Uploaded Date */}

                        <td>

                          <span className="text-muted small">
                            {resume.createdAt
                              ? new Date(
                                  resume.createdAt
                                ).toLocaleDateString()
                              : '—'}
                          </span>

                        </td>

                        {/* Actions */}

                        <td className="text-end">

                          <div className="d-inline-flex gap-2 flex-wrap justify-content-end">

                            <button
                              type="button"
                              className="btn btn-sm btn-info text-white"
                              onClick={() =>
                                handleViewResume(
                                  resume._id
                                )
                              }
                              title="View Resume"
                            >
                              View
                            </button>

                            <button
                              type="button"
                              className="btn btn-sm btn-success"
                              onClick={() =>
                                handleDownloadResume(
                                  resume
                                )
                              }
                              title="Download Resume"
                            >
                              Download
                            </button>

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-warning"
                              onClick={startEdit}
                              title="Edit Resume"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={handleDelete}
                              title="Delete Resume"
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>

                    ) : (

                      <tr>

                        <td
                          colSpan="4"
                          className="text-center py-5"
                        >

                          <div className="mb-3">

                            <FaFilePdf
                              className="text-muted"
                              style={{
                                fontSize: '42px',
                                opacity: 0.5,
                              }}
                            />

                          </div>

                          <h6 className="fw-bold mb-2">
                            No Resume Uploaded
                          </h6>

                          <p className="text-muted small mb-3">
                            Upload your resume to use it
                            for recruitment and AI interviews.
                          </p>

                          <button
                            type="button"
                            className="btn btn-primary px-4"
                            onClick={openAddForm}
                          >
                            Add Resume
                          </button>

                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </div>

        {/* ================================
            ADD / EDIT RESUME MODAL
        ================================= */}

        {showForm && (

          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.55)',
              zIndex: 1050,
              padding: '20px',
            }}
          >

            <div
              className="bg-white rounded-4 shadow-lg w-100"
              style={{
                maxWidth: '650px',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >

              {/* Modal Header */}

              <div className="d-flex align-items-center justify-content-between p-4 border-bottom">

                <div>
                  <h5 className="fw-bold mb-1">
                    {isEditing
                      ? 'EDIT YOUR RESUME'
                      : 'ADD YOUR RESUME'}
                  </h5>

                  <p className="text-muted small mb-0">
                    {isEditing
                      ? 'Update your resume details or upload a new PDF.'
                      : 'Upload your resume in PDF format.'}
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-light rounded-circle"
                  onClick={cancelEdit}
                  disabled={submitting}
                  style={{
                    width: '38px',
                    height: '38px',
                  }}
                >
                  <FaTimes />
                </button>

              </div>

              {/* Modal Body */}

              <div className="p-4">

                <form
                  onSubmit={
                    isEditing
                      ? handleUpdate
                      : handleSubmit
                  }
                >

                  {/* Student ID */}

                  <input
                    type="hidden"
                    name="student_id"
                    value={
                      user?.studentId ||
                      user?._id ||
                      ''
                    }
                  />

                  {/* Student Name */}

                  <div className="mb-4">

                    <label className="form-label fw-semibold">
                      Student Name
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter your full name"
                      value={studentName}
                      onChange={(e) =>
                        setStudentName(e.target.value)
                      }
                      required
                    />

                    <div className="form-text text-muted">
                      Enter the name that should appear on your resume.
                    </div>

                  </div>

                  {/* Existing Resume */}

                  {isEditing &&
                    resume &&
                    resume.resume_file && (

                      <div className="mb-4 p-3 bg-light rounded-3 border">

                        <label className="form-label fw-semibold small text-muted d-block mb-2">
                          Current Resume
                        </label>

                        <div className="d-flex align-items-center justify-content-between gap-3">

                          <div className="d-flex align-items-center gap-2 min-w-0">

                            <FaFilePdf className="text-danger fs-5 flex-shrink-0" />

                            <span className="text-truncate fw-semibold">
                              {resume.resume_file.fileName}
                            </span>

                          </div>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary flex-shrink-0"
                            onClick={() =>
                              handleViewResume(
                                resume._id
                              )
                            }
                          >
                            View PDF
                          </button>

                        </div>

                      </div>

                    )}

                  {/* File */}

                  <div className="mb-4">

                    <label className="form-label fw-semibold">
                      {isEditing
                        ? 'Choose New Resume'
                        : 'Choose Resume'}
                    </label>

                    <input
                      id="resumeFileInput"
                      type="file"
                      accept=".pdf,application/pdf"
                      className="form-control"
                      onChange={handleFileChange}
                      required={!isEditing}
                    />

                    <div className="form-text text-muted">
                      Only PDF files are accepted. Maximum file size: 10MB.
                    </div>

                    {selectedFile && (

                      <div className="mt-2 p-2 bg-light rounded border">

                        <div className="d-flex align-items-center gap-2">

                          <FaFilePdf className="text-danger" />

                          <span className="small fw-semibold text-truncate">
                            {selectedFile.name}
                          </span>

                        </div>

                      </div>

                    )}

                  </div>

                  {/* Buttons */}

                  <div className="d-flex justify-content-end gap-2 pt-2">

                    <button
                      type="button"
                      className="btn btn-light border px-4"
                      onClick={cancelEdit}
                      disabled={submitting}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary px-4 d-inline-flex align-items-center gap-2"
                      disabled={submitting}
                    >

                      <FaUpload />

                      {isEditing
                        ? submitting
                          ? 'Updating...'
                          : 'Update Resume'
                        : submitting
                        ? 'Uploading...'
                        : 'Submit Resume'}

                    </button>

                  </div>

                </form>

              </div>

            </div>

          </div>

        )}

      </div>
    </StudentLayout>
  );
};

export default StudentResume;