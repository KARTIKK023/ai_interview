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

  /* Registration & Basic */
  const [fullName, setFullName] = useState(
    user?.fullName || user?.name || ''
  );
  const [mobileNumber, setMobileNumber] = useState(
    user?.mobileNumber || user?.profile?.phone || ''
  );

  /* Personal Info */
  const [profilePhoto, setProfilePhoto] = useState(
    user?.profilePhoto || user?.profile?.profilePhoto || ''
  );
  const [previewUrl, setPreviewUrl] = useState(
    user?.profilePhoto || user?.profile?.profilePhoto || ''
  );
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState(
    user?.dateOfBirth || user?.profile?.dateOfBirth || ''
  );
  const [gender, setGender] = useState(
    user?.gender || user?.profile?.gender || ''
  );
  const [location, setLocation] = useState(
    user?.location || user?.profile?.location || ''
  );
  const [bio, setBio] = useState(
    user?.bio || user?.profile?.bio || ''
  );

  /* Education */
  const edu = user?.education || user?.profile?.education || {};

  const [highestQualification, setHighestQualification] = useState(
    edu.highestQualification || ''
  );
  const [collegeUniversity, setCollegeUniversity] = useState(
    edu.collegeUniversity || edu.college || ''
  );
  const [degree, setDegree] = useState(edu.degree || '');
  const [specialization, setSpecialization] = useState(
    edu.specialization || ''
  );
  const [graduationYear, setGraduationYear] = useState(
    edu.graduationYear || ''
  );
  const [cgpaPercentage, setCgpaPercentage] = useState(
    edu.cgpaPercentage || edu.cgpa || ''
  );

  /* Professional Links */
  const links =
    user?.professionalLinks ||
    user?.profile?.professionalLinks ||
    {};

  const [linkedin, setLinkedin] = useState(
    links.linkedin || user?.profile?.linkedin || ''
  );
  const [portfolio, setPortfolio] = useState(
    links.portfolio || user?.profile?.portfolio || ''
  );
  const [otherLink, setOtherLink] = useState(
    links.other || user?.profile?.otherLink || ''
  );

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || user.name || '');
      setMobileNumber(user.mobileNumber || user.profile?.phone || '');

      const photo =
        user.profilePhoto ||
        user.profile?.profilePhoto ||
        '';

      setProfilePhoto(photo);
      setPreviewUrl(photo);

      setDateOfBirth(
        user.dateOfBirth ||
        user.profile?.dateOfBirth ||
        ''
      );

      setGender(
        user.gender ||
        user.profile?.gender ||
        ''
      );

      setLocation(
        user.location ||
        user.profile?.location ||
        ''
      );

      setBio(
        user.bio ||
        user.profile?.bio ||
        ''
      );

      const currentEdu =
        user.education ||
        user.profile?.education ||
        {};

      setHighestQualification(
        currentEdu.highestQualification || ''
      );

      setCollegeUniversity(
        currentEdu.collegeUniversity ||
        currentEdu.college ||
        ''
      );

      setDegree(currentEdu.degree || '');

      setSpecialization(
        currentEdu.specialization || ''
      );

      setGraduationYear(
        currentEdu.graduationYear || ''
      );

      setCgpaPercentage(
        currentEdu.cgpaPercentage ||
        currentEdu.cgpa ||
        ''
      );

      const currentLinks =
        user.professionalLinks ||
        user.profile?.professionalLinks ||
        {};

      setLinkedin(
        currentLinks.linkedin ||
        user.profile?.linkedin ||
        ''
      );

      setPortfolio(
        currentLinks.portfolio ||
        user.profile?.portfolio ||
        ''
      );

      setOtherLink(
        currentLinks.other ||
        user.profile?.otherLink ||
        ''
      );
    }
  }, [user]);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    /* Validate image format */
    const validMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];

    const fileExt = file.name
      .split('.')
      .pop()
      ?.toLowerCase();

    const isValidType =
      validMimeTypes.includes(file.type) ||
      ['jpg', 'jpeg', 'png'].includes(fileExt || '');

    if (!isValidType) {
      toast.error(
        'Only JPG and PNG images are allowed'
      );

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      return;
    }

    /* Validate size */
    if (file.size > 2 * 1024 * 1024) {
      toast.error(
        'Image size must be less than 2MB'
      );

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      return;
    }

    /* Instant local preview */
    const localPreview =
      URL.createObjectURL(file);

    setPreviewUrl(localPreview);

    /* Auto upload */
    setUploadingPhoto(true);

    try {
      const formData = new FormData();

      formData.append('photo', file);

      const res = await API.post(
        '/auth/upload-photo',
        formData,
        {
          headers: {
            'Content-Type':
              'multipart/form-data'
          }
        }
      );

      if (res.data && res.data.success) {
        const newPhotoPath =
          res.data.profilePhoto ||
          res.data.user?.profilePhoto;

        setProfilePhoto(newPhotoPath);
        setPreviewUrl(newPhotoPath);

        if (res.data.user) {
          setUser(res.data.user);

          localStorage.setItem(
            'studentUser',
            JSON.stringify(res.data.user)
          );
        }

        toast.success(
          'Profile photo uploaded successfully'
        );
      }
    } catch (err) {
      console.error(
        'Failed to upload photo:',
        err
      );

      toast.error(
        err.response?.data?.message ||
        'Failed to upload photo'
      );

      setPreviewUrl(profilePhoto);
    } finally {
      setUploadingPhoto(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = () => {
    setProfilePhoto('');
    setPreviewUrl('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    toast.success(
      'Profile photo removed. Click "Save Profile" to persist changes.'
    );
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

      const res = await API.put(
        '/auth/profile',
        payload
      );

      if (res.data && res.data.user) {
        setUser(res.data.user);

        localStorage.setItem(
          'studentUser',
          JSON.stringify(res.data.user)
        );

        toast.success(
          'Profile & progress criteria updated successfully'
        );
      }
    } catch (err) {
      console.error(
        'Failed to update profile:',
        err
      );

      toast.error(
        err.response?.data?.message ||
        'Failed to update profile'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <StudentLayout>

      <style>{`
        .profile-page {
          --profile-primary: #4f46e5;
          --profile-primary-dark: #4338ca;
          --profile-primary-soft: #eef2ff;
          --profile-border: #e5e7eb;
          --profile-text: #1f2937;
          --profile-muted: #6b7280;
        }

        .profile-page .card-custom {
          border: 1px solid var(--profile-border) !important;
          border-radius: 14px !important;
          box-shadow:
            0 2px 5px rgba(15, 23, 42, 0.04),
            0 8px 20px rgba(15, 23, 42, 0.035) !important;
          transition: box-shadow 0.2s ease,
                      transform 0.2s ease;
        }

        .profile-page .card-custom:hover {
          box-shadow:
            0 4px 8px rgba(15, 23, 42, 0.05),
            0 12px 26px rgba(15, 23, 42, 0.05) !important;
        }

        .profile-page .section-title {
          color: var(--profile-text);
          font-size: 1rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
          padding-bottom: 14px;
          margin-bottom: 20px !important;
          border-bottom: 1px solid #f0f1f3;
        }

        .profile-page .section-title-icon {
          width: 34px;
          height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: var(--profile-primary-soft);
          color: var(--profile-primary);
          flex-shrink: 0;
        }

        .profile-page .form-label {
          color: #374151;
          font-size: 0.78rem;
          font-weight: 600;
          margin-bottom: 7px;
        }

        .profile-page .form-control,
        .profile-page .form-select {
          min-height: 42px;
          border: 1px solid #dfe3e8;
          border-radius: 8px;
          color: #1f2937;
          font-size: 0.875rem;
          box-shadow: none;
          transition:
            border-color 0.15s ease,
            box-shadow 0.15s ease;
        }

        .profile-page .form-control::placeholder {
          color: #9ca3af;
        }

        .profile-page .form-control:focus,
        .profile-page .form-select:focus {
          border-color: var(--profile-primary);
          box-shadow:
            0 0 0 3px rgba(79, 70, 229, 0.09);
        }

        .profile-page textarea.form-control {
          min-height: 72px;
          resize: vertical;
        }

        .profile-page .input-group-text {
          min-width: 40px;
          justify-content: center;
          border-color: #dfe3e8;
          color: #9ca3af;
          border-radius: 8px 0 0 8px;
        }

        .profile-page .input-group > .form-control {
          border-radius: 0 8px 8px 0;
        }

        .profile-page .profile-avatar {
          width: 104px;
          height: 104px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid #fff;
          box-shadow:
            0 0 0 1px #e5e7eb,
            0 6px 16px rgba(15, 23, 42, 0.10);
        }

        .profile-page .avatar-placeholder {
          width: 104px;
          height: 104px;
          border-radius: 50%;
          background: var(--profile-primary-soft);
          color: var(--profile-primary);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 0 1px #e0e7ff;
        }

        .profile-page .profile-camera {
          position: absolute;
          right: 1px;
          bottom: 2px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 2px solid #fff;
          background: var(--profile-primary);
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 8px rgba(15, 23, 42, 0.18);
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .profile-page .profile-camera:hover {
          background: var(--profile-primary-dark);
        }

        .profile-page .student-id-box {
          background: #f8fafc;
          border: 1px solid #e8ebef;
          border-radius: 10px;
        }

        .profile-page .student-id-label {
          color: #9ca3af;
          font-size: 0.66rem;
          letter-spacing: 0.06em;
          font-weight: 700;
        }

        .profile-page .student-id-value {
          color: var(--profile-primary);
          font-size: 1.05rem;
          letter-spacing: 0.02em;
        }

        .profile-page .locked-badge {
          color: #6b7280;
          background: #e5e7eb;
          border-radius: 5px;
          font-size: 0.68rem;
          padding: 4px 7px;
          font-weight: 600;
        }

        .profile-page .student-status {
          background: #ecfdf3 !important;
          color: #15803d !important;
          border: 1px solid #bbf7d0;
          font-size: 0.7rem;
          padding: 5px 8px;
          border-radius: 6px;
        }

        .profile-page .photo-upload-control {
          min-height: 42px;
          border: 1px solid #dfe3e8;
          border-radius: 8px;
          background: #fff;
        }

        .profile-page .photo-upload-control .btn {
          border-radius: 6px !important;
          font-size: 0.68rem;
        }

        .profile-page .btn-primary-custom {
          background: var(--profile-primary);
          border: 1px solid var(--profile-primary);
          color: #fff;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 600;
          box-shadow:
            0 2px 4px rgba(79, 70, 229, 0.18);
          transition:
            background 0.15s ease,
            border-color 0.15s ease,
            transform 0.15s ease,
            box-shadow 0.15s ease;
        }

        .profile-page .btn-primary-custom:hover {
          background: var(--profile-primary-dark);
          border-color: var(--profile-primary-dark);
          color: #fff;
          transform: translateY(-1px);
          box-shadow:
            0 4px 8px rgba(79, 70, 229, 0.22);
        }

        .profile-page .btn-primary-custom:disabled {
          opacity: 0.65;
          transform: none;
          box-shadow: none;
        }

        .profile-page .btn-photo {
          background: var(--profile-primary);
          border-color: var(--profile-primary);
          color: #fff;
        }

        .profile-page .btn-photo:hover {
          background: var(--profile-primary-dark);
          border-color: var(--profile-primary-dark);
          color: #fff;
        }

        .profile-page .page-title {
          color: #111827;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .profile-page .page-subtitle {
          color: #6b7280;
          font-size: 0.82rem;
        }

        .profile-page .profile-name {
          color: #111827;
          font-weight: 700;
        }

        .profile-page .profile-email {
          color: #6b7280;
          font-size: 0.78rem;
        }

        .profile-page .save-area {
          border-top: 1px solid #e5e7eb;
          padding-top: 18px;
        }

        .profile-page .extra-small {
          font-size: 0.68rem;
        }

        @media (max-width: 767.98px) {
          .profile-page .card-custom {
            padding: 1.1rem !important;
          }

          .profile-page .save-area {
            justify-content: stretch !important;
          }

          .profile-page .save-area .btn {
            width: 100%;
            justify-content: center;
          }

          .profile-page .photo-upload-control {
            flex-wrap: wrap;
            height: auto;
            padding: 7px !important;
            gap: 7px;
          }

          .profile-page .photo-upload-control > span {
            width: 100%;
          }

          .profile-page .photo-upload-control > div {
            width: 100%;
          }
        }
      `}</style>

      <div className="profile-page">

        {/* PAGE HEADER */}
        <div className="mb-4">
          <h3 className="page-title mb-1">
            Student Profile
          </h3>

          <p className="page-subtitle mb-0">
            Manage your profile details, education,
            and professional criteria to increase your
            Profile Progress
          </p>
        </div>

        <form onSubmit={handleUpdate}>

          {/* TOP SECTION */}
          <div className="row g-4 mb-4">

            {/* STUDENT IDENTIFICATION */}
            <div className="col-lg-4">
              <div className="card card-custom p-4 bg-white border-0 text-center h-100">

                <div className="mb-3">
                  <span className="section-title-icon mx-auto">
                    <FaIdCard size={14} />
                  </span>
                </div>

                {/* PROFILE IMAGE */}
                <div className="position-relative d-inline-block mx-auto mb-3">

                  {previewUrl || profilePhoto ? (
                    <img
                      src={
                        previewUrl ||
                        profilePhoto
                      }
                      alt="Profile Avatar"
                      className="profile-avatar"
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      <FaUser size={42} />
                    </div>
                  )}

                  <button
                    type="button"
                    className="profile-camera"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    disabled={uploadingPhoto}
                    title="Change profile photo"
                  >
                    <FaCamera size={11} />
                  </button>
                </div>

                <h5 className="profile-name mb-1">
                  {fullName ||
                    user?.name ||
                    'Student'}
                </h5>

                <p className="profile-email mb-4">
                  {user?.email}
                </p>

                {/* STUDENT ID */}
                <div className="student-id-box p-3 text-start mb-3">

                  <label className="student-id-label d-block mb-1">
                    SYSTEM STUDENT ID
                  </label>

                  <div className="d-flex align-items-center justify-content-between gap-2">

                    <span className="student-id-value font-monospace fw-bold">
                      {user?.studentId ||
                        user?.student_id ||
                        'STU-2026-00001'}
                    </span>

                    <span className="locked-badge d-flex align-items-center gap-1">
                      <FaLock size={9} />
                      Locked
                    </span>

                  </div>
                </div>

                {/* STATUS */}
                <div className="d-flex justify-content-between align-items-center text-muted small px-1">
                  <span>Role Status:</span>

                  <span className="student-status d-flex align-items-center gap-1 fw-semibold">
                    <FaCheckCircle size={10} />
                    Student
                  </span>
                </div>

                {/* PHOTO INPUT */}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="d-none"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleFileSelect}
                />

              </div>
            </div>

            {/* PERSONAL INFORMATION */}
            <div className="col-lg-8">
              <div className="card card-custom p-4 bg-white border-0 h-100">

                <h5 className="section-title">
                  <span className="section-title-icon">
                    <FaUser size={14} />
                  </span>

                  <span>
                    Personal Information
                    <small className="d-block text-muted fw-normal mt-1">
                      Keep your personal and contact details up to date
                    </small>
                  </span>
                </h5>

                <div className="row g-3">

                  {/* FULL NAME */}
                  <div className="col-md-6">
                    <label className="form-label">
                      Full Name
                    </label>

                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <FaUser size={13} />
                      </span>

                      <input
                        type="text"
                        className="form-control"
                        value={fullName}
                        onChange={(e) =>
                          setFullName(
                            e.target.value
                          )
                        }
                        required
                      />
                    </div>
                  </div>

                  {/* EMAIL */}
                  <div className="col-md-6">
                    <label className="form-label">
                      Email Address
                    </label>

                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <FaEnvelope size={13} />
                      </span>

                      <input
                        type="email"
                        className="form-control bg-light"
                        value={
                          user?.email || ''
                        }
                        readOnly
                        disabled
                      />
                    </div>
                  </div>

                  {/* MOBILE */}
                  <div className="col-md-6">
                    <label className="form-label">
                      Mobile Number
                    </label>

                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <FaPhone size={13} />
                      </span>

                      <input
                        type="tel"
                        className="form-control"
                        placeholder="Enter mobile number"
                        value={mobileNumber}
                        onChange={(e) =>
                          setMobileNumber(
                            e.target.value
                          )
                        }
                        required
                      />
                    </div>
                  </div>

                  {/* PHOTO */}
                  <div className="col-md-6">
                    <label className="form-label">
                      Profile Photo
                    </label>

                    <div className="input-group profile-photo-compact">

                      <span className="input-group-text bg-light">
                        <FaCamera size={13} />
                      </span>

                      <div className="form-control photo-upload-control d-flex align-items-center justify-content-between p-1 px-2">

                        <div className="d-flex align-items-center gap-1">

                          <button
                            type="button"
                            className="btn btn-photo btn-sm py-1 px-2 fw-semibold d-flex align-items-center gap-1"
                            onClick={() =>
                              fileInputRef.current?.click()
                            }
                            disabled={uploadingPhoto}
                            style={{
                              whiteSpace:
                                'nowrap'
                            }}
                          >
                            <FaCamera size={9} />

                            {uploadingPhoto
                              ? 'Uploading...'
                              : previewUrl ||
                                profilePhoto
                              ? 'Change'
                              : 'Upload Photo'}
                          </button>

                          {(previewUrl ||
                            profilePhoto) && (
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm py-1 px-2 fw-semibold d-flex align-items-center justify-content-center"
                              onClick={
                                handleRemovePhoto
                              }
                              disabled={
                                uploadingPhoto
                              }
                              title="Remove photo"
                            >
                              <FaTrash size={10} />
                            </button>
                          )}

                        </div>

                        <span className="text-muted extra-small ms-2">
                          JPG/PNG • Max 2MB
                        </span>

                      </div>
                    </div>
                  </div>

                  {/* DOB */}
                  <div className="col-md-4">
                    <label className="form-label">
                      Date of Birth
                    </label>

                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <FaCalendarAlt size={12} />
                      </span>

                      <input
                        type="date"
                        className="form-control"
                        value={dateOfBirth}
                        onChange={(e) =>
                          setDateOfBirth(
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* GENDER */}
                  <div className="col-md-4">
                    <label className="form-label">
                      Gender
                    </label>

                    <select
                      className="form-select"
                      value={gender}
                      onChange={(e) =>
                        setGender(
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        Select Gender
                      </option>

                      <option value="Male">
                        Male
                      </option>

                      <option value="Female">
                        Female
                      </option>

                      <option value="Non-binary">
                        Non-binary
                      </option>

                      <option value="Prefer not to say">
                        Prefer not to say
                      </option>
                    </select>
                  </div>

                  {/* LOCATION */}
                  <div className="col-md-4">
                    <label className="form-label">
                      Location / City
                    </label>

                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <FaMapMarkerAlt size={12} />
                      </span>

                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Bangalore, India"
                        value={location}
                        onChange={(e) =>
                          setLocation(
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* BIO */}
                  <div className="col-12">
                    <label className="form-label">
                      About / Bio
                    </label>

                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="Brief professional summary..."
                      value={bio}
                      onChange={(e) =>
                        setBio(
                          e.target.value
                        )
                      }
                    />
                  </div>

                </div>
              </div>
            </div>

          </div>

          {/* BOTTOM SECTIONS */}
          <div className="row g-4 mb-4">

            {/* EDUCATION */}
            <div className="col-lg-6">
              <div className="card card-custom p-4 bg-white border-0 h-100">

                <h5 className="section-title">
                  <span className="section-title-icon">
                    <FaGraduationCap size={15} />
                  </span>

                  <span>
                    Education Details
                    <small className="d-block text-muted fw-normal mt-1">
                      Add your academic background and qualifications
                    </small>
                  </span>
                </h5>

                <div className="row g-3">

                  {/* QUALIFICATION */}
                  <div className="col-md-6">
                    <label className="form-label">
                      Highest Qualification
                    </label>

                    <select
                      className="form-select"
                      value={
                        highestQualification
                      }
                      onChange={(e) =>
                        setHighestQualification(
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        Select Qualification
                      </option>

                      <option value="Bachelor's Degree">
                        Bachelor's Degree
                      </option>

                      <option value="Master's Degree">
                        Master's Degree
                      </option>

                      <option value="Doctorate / PhD">
                        Doctorate / PhD
                      </option>

                      <option value="Diploma">
                        Diploma
                      </option>

                      <option value="High School">
                        High School
                      </option>
                    </select>
                  </div>

                  {/* UNIVERSITY */}
                  <div className="col-md-6">
                    <label className="form-label">
                      College / University
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="University name"
                      value={
                        collegeUniversity
                      }
                      onChange={(e) =>
                        setCollegeUniversity(
                          e.target.value
                        )
                      }
                    />
                  </div>

                  {/* DEGREE */}
                  <div className="col-md-6">
                    <label className="form-label">
                      Degree
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. B.Tech / B.E."
                      value={degree}
                      onChange={(e) =>
                        setDegree(
                          e.target.value
                        )
                      }
                    />
                  </div>

                  {/* SPECIALIZATION */}
                  <div className="col-md-6">
                    <label className="form-label">
                      Specialization
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Computer Science"
                      value={specialization}
                      onChange={(e) =>
                        setSpecialization(
                          e.target.value
                        )
                      }
                    />
                  </div>

                  {/* GRADUATION */}
                  <div className="col-md-6">
                    <label className="form-label">
                      Graduation Year
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 2026"
                      value={
                        graduationYear
                      }
                      onChange={(e) =>
                        setGraduationYear(
                          e.target.value
                        )
                      }
                    />
                  </div>

                  {/* CGPA */}
                  <div className="col-md-6">
                    <label className="form-label">
                      CGPA / Percentage
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 8.5 CGPA or 85%"
                      value={
                        cgpaPercentage
                      }
                      onChange={(e) =>
                        setCgpaPercentage(
                          e.target.value
                        )
                      }
                    />
                  </div>

                </div>
              </div>
            </div>

            {/* PROFESSIONAL LINKS */}
            <div className="col-lg-6">
              <div className="card card-custom p-4 bg-white border-0 h-100">

                <h5 className="section-title">
                  <span className="section-title-icon">
                    <FaLink size={14} />
                  </span>

                  <span>
                    Professional Links
                    <small className="d-block text-muted fw-normal mt-1">
                      Showcase your professional presence
                    </small>
                  </span>
                </h5>

                <div className="row g-3">

                  {/* LINKEDIN */}
                  <div className="col-12">
                    <label className="form-label">
                      LinkedIn Profile URL
                    </label>

                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <FaLink size={12} />
                      </span>

                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://linkedin.com/in/username"
                        value={linkedin}
                        onChange={(e) =>
                          setLinkedin(
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* PORTFOLIO */}
                  <div className="col-12">
                    <label className="form-label">
                      Portfolio URL
                    </label>

                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <FaGlobe size={12} />
                      </span>

                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://yourportfolio.com"
                        value={portfolio}
                        onChange={(e) =>
                          setPortfolio(
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* OTHER */}
                  <div className="col-12">
                    <label className="form-label">
                      Other Professional Link
                      <span className="text-muted fw-normal ms-1">
                        (GitHub / LeetCode)
                      </span>
                    </label>

                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <FaLink size={12} />
                      </span>

                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://github.com/username"
                        value={otherLink}
                        onChange={(e) =>
                          setOtherLink(
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>

          {/* SAVE */}
          <div className="save-area d-flex justify-content-end mb-4">

            <button
              type="submit"
              className="btn btn-primary-custom px-4 py-2 d-flex align-items-center gap-2"
              disabled={saving}
            >
              <FaSave size={13} />

              {saving
                ? 'Saving Changes...'
                : 'Save Profile & Update Progress'}
            </button>

          </div>

        </form>
      </div>
    </StudentLayout>
  );
};

export default StudentProfile;