import React, { useContext, useState, useEffect } from 'react';
import StudentLayout from '../../components/StudentLayout';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import toast from 'react-hot-toast';
import { FaFilePdf, FaEdit, FaTrash, FaUpload, FaDownload, FaTimes } from 'react-icons/fa';

const StudentResume = () => {
  const { user } = useContext(AuthContext);
  const [studentName, setStudentName] = useState(user?.fullName || user?.name || '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch student's existing resume on mount
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
      toast.error(err.response?.data?.message || 'Failed to fetch resume details');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        toast.error('Only PDF files (.pdf) are allowed.');
        e.target.value = '';
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  };

  // Submit new resume
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
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Resume uploaded successfully');
        setResume(res.data.resume);
        setSelectedFile(null);
        // Clear file input element
        const fileInput = document.getElementById('resumeFileInput');
        if (fileInput) fileInput.value = '';
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit resume');
    } finally {
      setSubmitting(false);
    }
  };

  // Enable Edit Mode
  const startEdit = () => {
    if (!resume) return;
    setStudentName(resume.student_name || user?.fullName || user?.name || '');
    setSelectedFile(null);
    setIsEditing(true);
  };

  // Cancel Edit Mode
  const cancelEdit = () => {
    setIsEditing(false);
    setSelectedFile(null);
    setStudentName(user?.fullName || user?.name || '');
    const fileInput = document.getElementById('resumeFileInput');
    if (fileInput) fileInput.value = '';
  };

  // Update existing resume
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

      const res = await API.put(`/resume/${resume._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Resume updated successfully');
        setResume(res.data.resume);
        setIsEditing(false);
        setSelectedFile(null);
        const fileInput = document.getElementById('resumeFileInput');
        if (fileInput) fileInput.value = '';
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update resume');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete resume
  const handleDelete = async () => {
    if (!resume) return;
    if (!window.confirm('Are you sure you want to delete your resume?')) return;

    try {
      const res = await API.delete(`/resume/${resume._id}`);
      if (res.data.success) {
        toast.success(res.data.message || 'Resume deleted successfully');
        setResume(null);
        setIsEditing(false);
        setSelectedFile(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete resume');
    }
  };

  // View Resume in browser new tab
  const handleViewResume = async (id) => {
    try {
      const token = localStorage.getItem('studentToken') || localStorage.getItem('token');
      const response = await API.get(`/resume/file/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        responseType: 'blob'
      });

      // Check if server returned JSON error inside blob
      if (response.data.type === 'application/json') {
        const text = await response.data.text();
        const json = JSON.parse(text);
        toast.error(json.message || 'Failed to view resume');
        return;
      }

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('View Resume Error:', error);
      let errorMsg = 'Failed to view resume';
      if (error.response && error.response.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const json = JSON.parse(text);
          errorMsg = json.message || errorMsg;
        } catch (e) {}
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toast.error(errorMsg);
    }
  };

  // Download Resume with original filename
  const handleDownloadResume = async (resumeData) => {
    try {
      const token = localStorage.getItem('studentToken') || localStorage.getItem('token');
      const response = await API.get(`/resume/file/${resumeData._id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        responseType: 'blob'
      });

      // Check if server returned JSON error inside blob
      if (response.data.type === 'application/json') {
        const text = await response.data.text();
        const json = JSON.parse(text);
        toast.error(json.message || 'Failed to download resume');
        return;
      }

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = resumeData.resume_file?.fileName || 'resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download Resume Error:', error);
      let errorMsg = 'Failed to download resume';
      if (error.response && error.response.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const json = JSON.parse(text);
          errorMsg = json.message || errorMsg;
        } catch (e) {}
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toast.error(errorMsg);
    }
  };

  return (
    <StudentLayout>
      <div className="mb-4 text-center text-md-start">
        <h3 className="fw-extrabold mb-1">MY RESUME</h3>
        <p className="text-muted small">Upload and manage your student resume for recruitment and AI interviews</p>
      </div>

            <div className="row g-4">
              {/* LEFT HALF — ADD / EDIT YOUR RESUME */}
              <div className="col-md-6">
                <div className="card card-custom p-4 bg-white shadow-sm border-0 h-100">
                  <h5 className="fw-bold mb-4 text-primary">
                    {isEditing ? 'EDIT YOUR RESUME' : 'ADD YOUR RESUME'}
                  </h5>

                  <form onSubmit={isEditing ? handleUpdate : handleSubmit}>
                    {/* Hidden Student ID input */}
                    <input
                      type="hidden"
                      name="student_id"
                      value={user?.studentId || user?._id || ''}
                    />

                    {/* Student Name */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Student Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Student Name"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        required
                      />
                    </div>

                    {/* Existing Resume Display (Edit Mode) */}
                    {isEditing && resume && resume.resume_file && (
                      <div className="mb-3 p-3 bg-light rounded border">
                        <label className="form-label fw-semibold small text-muted d-block mb-1">
                          Existing Resume
                        </label>
                        <div className="d-flex align-items-center justify-content-between">
                          <span className="text-truncate fw-bold text-dark me-2">
                            📄 {resume.resume_file.fileName}
                          </span>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                            onClick={() => handleViewResume(resume._id)}
                          >
                            <FaDownload size={12} /> View PDF
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Choose Resume / Choose New Resume */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold small">
                        {isEditing ? 'Choose New Resume' : 'Choose Resume'}
                      </label>
                      <input
                        id="resumeFileInput"
                        type="file"
                        accept=".pdf,application/pdf"
                        className="form-control"
                        onChange={handleFileChange}
                        required={!isEditing}
                      />
                      <div className="form-text extra-small text-muted mt-1">
                        Only PDF format (.pdf) is accepted. Max file size: 10MB.
                      </div>
                    </div>

                    {/* Buttons */}
                    {isEditing ? (
                      <div className="d-flex gap-2">
                        <button
                          type="submit"
                          className="btn btn-primary d-inline-flex align-items-center gap-2"
                          disabled={submitting}
                        >
                          <FaUpload /> {submitting ? 'Updating...' : 'Update Resume'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary d-inline-flex align-items-center gap-2"
                          onClick={cancelEdit}
                          disabled={submitting}
                        >
                          <FaTimes /> Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="submit"
                        className="btn btn-primary d-inline-flex align-items-center gap-2"
                        disabled={submitting || (resume !== null)}
                      >
                        <FaUpload /> {submitting ? 'Submitting...' : 'Submit Resume'}
                      </button>
                    )}

                    {/* Hint if resume already exists in Create Mode */}
                    {!isEditing && resume && (
                      <div className="mt-3 text-warning extra-small fw-semibold">
                        * You already have an active resume. Use the ✏️ Edit button on the right to update your resume.
                      </div>
                    )}
                  </form>
                </div>
              </div>

              {/* RIGHT HALF — MY RESUME TABLE */}
              <div className="col-md-6">
                <div className="card card-custom p-4 bg-white shadow-sm border-0 h-100">
                  <h5 className="fw-bold mb-4 text-primary">MY RESUME</h5>

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
                            <th>Student Name</th>
                            <th className="text-end">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resume ? (
                            <tr>
                              <td className="fw-semibold">
                                <div className="d-flex align-items-center gap-2">
                                  <FaFilePdf className="text-danger fs-5" />
                                  <div>
                                    <div>{resume.student_name}</div>
                                    <div className="text-muted extra-small">
                                      {resume.resume_file?.fileName}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="text-end">
                                <div className="d-inline-flex gap-2">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-info text-white d-inline-flex align-items-center gap-1"
                                    onClick={() => handleViewResume(resume._id)}
                                    title="View Resume"
                                  >
                                    👁️
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-success d-inline-flex align-items-center gap-1"
                                    onClick={() => handleDownloadResume(resume)}
                                    title="Download Resume"
                                  >
                                    ⬇️
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-warning d-inline-flex align-items-center gap-1"
                                    onClick={startEdit}
                                    title="Edit Resume"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
                                    onClick={handleDelete}
                                    title="Delete Resume"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            <tr>
                              <td colSpan="2" className="text-center text-muted py-4">
                                No resume uploaded yet. Use the form on the left to submit your resume.
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

export default StudentResume;
