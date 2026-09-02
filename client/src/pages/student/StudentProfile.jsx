import React, { useContext, useState, useEffect, useRef } from 'react';
import StudentLayout from '../../components/StudentLayout';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import toast from 'react-hot-toast';
import {
  FaUser,
  FaIdCard,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaCheckCircle,
  FaSave,
  FaGraduationCap,
  FaLink,
  FaCamera,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaGlobe,
  FaTrash,
  FaUpload
} from 'react-icons/fa';

const StudentProfile = () => {
  const { user, setUser } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  // Registration & Basic
  const [fullName, setFullName] = useState(user?.fullName || user?.name || '');
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || user?.profile?.phone || '');

  // Personal Info
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || user?.profile?.profilePhoto || '');
  const [previewUrl, setPreviewUrl] = useState(user?.profilePhoto || user?.profile?.profilePhoto || '');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || user?.profile?.dateOfBirth || '');
  const [gender, setGender] = useState(user?.gender || user?.profile?.gender || '');
  const [location, setLocation] = useState(user?.location || user?.profile?.location || '');
  const [bio, setBio] = useState(user?.bio || user?.profile?.bio || '');

  // Education
  const edu = user?.education || user?.profile?.education || {};
  const [highestQualification, setHighestQualification] = useState(edu.highestQualification || '');
  const [collegeUniversity, setCollegeUniversity] = useState(edu.collegeUniversity || edu.college || '');
  const [degree, setDegree] = useState(edu.degree || '');
  const [specialization, setSpecialization] = useState(edu.specialization || '');
  const [graduationYear, setGraduationYear] = useState(edu.graduationYear || '');
  const [cgpaPercentage, setCgpaPercentage] = useState(edu.cgpaPercentage || edu.cgpa || '');

  // Professional Links
  const links = user?.professionalLinks || user?.profile?.professionalLinks || {};
  const [linkedin, setLinkedin] = useState(links.linkedin || user?.profile?.linkedin || '');
  const [portfolio, setPortfolio] = useState(links.portfolio || user?.profile?.portfolio || '');
  const [otherLink, setOtherLink] = useState(links.other || user?.profile?.otherLink || '');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || user.name || '');
      setMobileNumber(user.mobileNumber || user.profile?.phone || '');
      const photo = user.profilePhoto || user.profile?.profilePhoto || '';
      setProfilePhoto(photo);
      setPreviewUrl(photo);
      setDateOfBirth(user.dateOfBirth || user.profile?.dateOfBirth || '');
      setGender(user.gender || user.profile?.gender || '');
      setLocation(user.location || user.profile?.location || '');
      setBio(user.bio || user.profile?.bio || '');

      const currentEdu = user.education || user.profile?.education || {};
      setHighestQualification(currentEdu.highestQualification || '');
      setCollegeUniversity(currentEdu.collegeUniversity || currentEdu.college || '');
      setDegree(currentEdu.degree || '');
      setSpecialization(currentEdu.specialization || '');
      setGraduationYear(currentEdu.graduationYear || '');
      setCgpaPercentage(currentEdu.cgpaPercentage || currentEdu.cgpa || '');

      const currentLinks = user.professionalLinks || user.profile?.professionalLinks || {};
      setLinkedin(currentLinks.linkedin || user.profile?.linkedin || '');
      setPortfolio(currentLinks.portfolio || user.profile?.portfolio || '');
      setOtherLink(currentLinks.other || user.profile?.otherLink || '');
    }
  }, [user]);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format (JPG or PNG)
    const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const isValidType = validMimeTypes.includes(file.type) || ['jpg', 'jpeg', 'png'].includes(fileExt || '');

    if (!isValidType) {
      toast.error('Only JPG and PNG images are allowed');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Instant local preview
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    // Auto upload to server
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const res = await API.post('/auth/upload-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data && res.data.success) {
        const newPhotoPath = res.data.profilePhoto || res.data.user?.profilePhoto;
        setProfilePhoto(newPhotoPath);
        setPreviewUrl(newPhotoPath);
        if (res.data.user) {
          setUser(res.data.user);
          localStorage.setItem('studentUser', JSON.stringify(res.data.user));
        }
        toast.success('Profile photo uploaded successfully');
      }
    } catch (err) {
      console.error('Failed to upload photo:', err);
      toast.error(err.response?.data?.message || 'Failed to upload photo');
      setPreviewUrl(profilePhoto); // Revert to saved photo
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = () => {
    setProfilePhoto('');
    setPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.success('Profile photo removed. Click "Save Profile" to persist changes.');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        fullName,
        mobileNumber,
        profilePhoto,
        dateOfBirth,
        gender,
        location,
        bio,
        education: {
          highestQualification,
          collegeUniversity,
          degree,
          specialization,
          graduationYear,
          cgpaPercentage
        },
        professionalLinks: {
          linkedin,
          portfolio,
          other: otherLink
        },
        profile: {
          phone: mobileNumber,
          bio,
          profilePhoto,
          dateOfBirth,
          gender,
          location,
          education: {
            highestQualification,
            collegeUniversity,
            degree,
            specialization,
            graduationYear,
            cgpaPercentage
          },
          professionalLinks: {
            linkedin,
            portfolio,
            other: otherLink
          }
        }
      };

      const res = await API.put('/auth/profile', payload);
      if (res.data && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('studentUser', JSON.stringify(res.data.user));
        toast.success('Profile & progress criteria updated successfully');
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <StudentLayout>
      <div className="mb-4">
        <h3 className="fw-extrabold mb-1">Student Profile</h3>
        <p className="text-muted small">Manage your profile details, education, and professional criteria to increase your Profile Progress</p>
      </div>

      <form onSubmit={handleUpdate}>
        <div className="row g-4 mb-4">
          {/* STUDENT IDENTIFICATION CARD */}
          <div className="col-lg-4">
            <div className="card card-custom p-4 bg-white shadow-sm border-0 text-center h-100">
              <div className="position-relative d-inline-block mx-auto mb-3">
                {previewUrl || profilePhoto ? (
                  <img
                    src={previewUrl || profilePhoto}
                    alt="Profile Avatar"
                    className="rounded-circle border border-3 border-primary shadow-sm"
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-4 mx-auto d-inline-flex align-items-center justify-content-center" style={{ width: '100px', height: '100px' }}>
                    <FaUser size={48} />
                  </div>
                )}
              </div>

              <h5 className="fw-bold mb-1">{fullName || user?.name || 'Student'}</h5>
              <p className="text-muted small mb-3">{user?.email}</p>

              <div className="p-3 bg-light rounded-3 border text-start mb-3">
                <label className="text-uppercase text-muted fw-bold extra-small d-block mb-1">
                  System Student ID
                </label>
                <div className="d-flex align-items-center justify-content-between">
                  <span className="font-monospace fw-bold fs-5 text-primary">
                    {user?.studentId || user?.student_id || 'STU-2026-00001'}
                  </span>
                  <span className="badge bg-secondary d-flex align-items-center gap-1 small">
                    <FaLock size={10} /> Locked
                  </span>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center text-muted small px-2">
                <span>Role Status:</span>
                <span className="badge bg-success">
                  <FaCheckCircle className="me-1" /> Student
                </span>
              </div>
            </div>
          </div>

          {/* BASIC & PERSONAL INFORMATION */}
          <div className="col-lg-8">
            <div className="card card-custom p-4 bg-white shadow-sm border-0 h-100">
              <h5 className="fw-bold mb-3 text-primary d-flex align-items-center gap-2">
                <FaUser /> Personal Information
              </h5>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Full Name</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted"><FaUser /></span>
                    <input
                      type="text"
                      className="form-control"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted"><FaEnvelope /></span>
                    <input
                      type="email"
                      className="form-control bg-light"
                      value={user?.email || ''}
                      readOnly
                      disabled
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Mobile Number</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted"><FaPhone /></span>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="Enter mobile number"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* COMPACT PROFILE PHOTO UPLOAD FIELD */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Profile Photo</label>
                  <div className="input-group profile-photo-compact">
                    <span className="input-group-text bg-light text-muted"><FaCamera /></span>
                    <div className="form-control d-flex align-items-center justify-content-between p-1 px-2 bg-white">
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="d-none"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={handleFileSelect}
                      />

                      <div className="d-flex align-items-center gap-1">
                        <button
                          type="button"
                          className="btn btn-primary btn-sm py-1 px-2 extra-small fw-semibold d-flex align-items-center gap-1"
                          style={{ whiteSpace: 'nowrap', minWidth: '10px' }}
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingPhoto}
                        >
                          <FaCamera size={8} /> {uploadingPhoto ? 'Uploading...' : (previewUrl || profilePhoto ? 'Change' : 'Upload Photo')}
                          
                        </button>

                        {(previewUrl || profilePhoto) && (
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm py-0.5 px-1 extra-small fw-semibold d-flex align-items-center gap-0.5"
                            style={{ whiteSpace: 'nowrap', minWidth: '10px' }}
                            onClick={handleRemovePhoto}
                            disabled={uploadingPhoto}
                          >
                            <FaTrash size={14} />
                          </button>
                        )}
                      </div>

                      <span className="text-muted extra-small ms-auto">JPG/PNG • Max 2MB</span>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold small">Date of Birth</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold small">Gender</label>
                  <select
                    className="form-select"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold small">Location / City</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Bangalore, India"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold small">About / Bio</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Brief professional summary..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* EDUCATION SECTION */}
          <div className="col-lg-6">
            <div className="card card-custom p-4 bg-white shadow-sm border-0 h-100">
              <h5 className="fw-bold mb-3 text-primary d-flex align-items-center gap-2">
                <FaGraduationCap /> Education Details (25%)
              </h5>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Highest Qualification</label>
                  <select
                    className="form-select"
                    value={highestQualification}
                    onChange={(e) => setHighestQualification(e.target.value)}
                  >
                    <option value="">Select Qualification</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="Doctorate / PhD">Doctorate / PhD</option>
                    <option value="Diploma">Diploma</option>
                    <option value="High School">High School</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold small">College / University</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="University name"
                    value={collegeUniversity}
                    onChange={(e) => setCollegeUniversity(e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Degree</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. B.Tech / B.E."
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Specialization</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Computer Science"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Graduation Year</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 2026"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold small">CGPA / Percentage</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 8.5 CGPA or 85%"
                    value={cgpaPercentage}
                    onChange={(e) => setCgpaPercentage(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* PROFESSIONAL LINKS SECTION */}
          <div className="col-lg-6">
            <div className="card card-custom p-4 bg-white shadow-sm border-0 h-100">
              <h5 className="fw-bold mb-3 text-primary d-flex align-items-center gap-2">
                <FaLink /> Professional Links (15%)
              </h5>

              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-semibold small">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://linkedin.com/in/username"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold small">Portfolio URL</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://yourportfolio.com"
                    value={portfolio}
                    onChange={(e) => setPortfolio(e.target.value)}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold small">Other Professional Link (GitHub / LeetCode)</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://github.com/username"
                    value={otherLink}
                    onChange={(e) => setOtherLink(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SAVE BUTTON BAR */}
        <div className="d-flex justify-content-end mb-4">
          <button
            type="submit"
            className="btn btn-primary-custom px-4 py-2 d-flex align-items-center gap-2"
            disabled={saving}
          >
            <FaSave /> {saving ? 'Saving Changes...' : 'Save Profile & Update Progress'}
          </button>
        </div>
      </form>
    </StudentLayout>
  );
};

export default StudentProfile;
