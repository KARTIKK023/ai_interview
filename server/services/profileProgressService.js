const Resume = require('../models/Resume');

/**
 * Calculates student profile completion progress percentage dynamically from MongoDB user and resume data.
 * Total Possible = 100%
 */
const calculateProfileProgress = async (user, resumeDoc = null) => {
  if (!user) {
    return {
      progress: 0,
      completedWeight: 0,
      remainingWeight: 100,
      sections: {
        registration: { weight: 15, completed: 0, percentage: 0, fields: {} },
        personal: { weight: 15, completed: 0, percentage: 0, fields: {} },
        education: { weight: 25, completed: 0, percentage: 0, fields: {} },
        resume: { weight: 30, completed: 0, percentage: 0, fields: {} },
        professionalLinks: { weight: 15, completed: 0, percentage: 0, fields: {} }
      }
    };
  }

  // Fetch resume if not provided
  let resume = resumeDoc;
  if (!resume) {
    try {
      const studentIds = [user.studentId, user._id?.toString(), user.email].filter(Boolean);
      resume = await Resume.findOne({
        $or: [
          { studentId: { $in: studentIds } },
          { student_id: { $in: studentIds } },
          { userId: user._id }
        ]
      });
    } catch (err) {
      console.error('Error fetching resume for profile progress:', err.message);
    }
  }

  // 1. REGISTRATION INFORMATION = 15%
  // Full Name = 5%, Email = 5%, Mobile = 5%
  const hasFullName = Boolean((user.fullName || user.name || '').trim());
  const hasEmail = Boolean((user.email || '').trim());
  const hasMobile = Boolean((user.mobileNumber || user.profile?.phone || '').trim());

  const regCompleted = (hasFullName ? 5 : 0) + (hasEmail ? 5 : 0) + (hasMobile ? 5 : 0);
  const regSection = {
    weight: 15,
    completed: regCompleted,
    percentage: Math.round((regCompleted / 15) * 100),
    fields: {
      fullName: hasFullName,
      email: hasEmail,
      mobileNumber: hasMobile
    }
  };

  // 2. PERSONAL INFORMATION = 15%
  // Profile Photo = 3%, Date of Birth = 3%, Gender = 3%, Location = 3%, About/Bio = 3%
  const photo = user.profilePhoto || user.profile?.profilePhoto || user.profile?.avatar || '';
  const dob = user.dateOfBirth || user.profile?.dateOfBirth || user.profile?.dob || '';
  const gender = user.gender || user.profile?.gender || '';
  const location = user.location || user.profile?.location || user.profile?.city || '';
  const bio = user.bio || user.profile?.bio || '';

  const hasPhoto = Boolean((photo || '').trim());
  const hasDob = Boolean((dob || '').trim());
  const hasGender = Boolean((gender || '').trim());
  const hasLocation = Boolean((location || '').trim());
  const hasBio = Boolean((bio || '').trim());

  const personalCompleted = (hasPhoto ? 3 : 0) + (hasDob ? 3 : 0) + (hasGender ? 3 : 0) + (hasLocation ? 3 : 0) + (hasBio ? 3 : 0);
  const personalSection = {
    weight: 15,
    completed: personalCompleted,
    percentage: Math.round((personalCompleted / 15) * 100),
    fields: {
      profilePhoto: hasPhoto,
      dateOfBirth: hasDob,
      gender: hasGender,
      location: hasLocation,
      bio: hasBio
    }
  };

  // 3. EDUCATION = 25%
  // Highest Qualification = 5%, College/University = 5%, Degree = 4%, Specialization = 4%, Graduation Year = 4%, CGPA/Percentage = 3%
  const edu = user.education || user.profile?.education || {};
  const hq = edu.highestQualification || user.profile?.highestQualification || '';
  const college = edu.collegeUniversity || edu.college || user.profile?.college || '';
  const degree = edu.degree || user.profile?.degree || '';
  const spec = edu.specialization || user.profile?.specialization || '';
  const gradYear = edu.graduationYear || user.profile?.graduationYear || '';
  const cgpa = edu.cgpaPercentage || edu.cgpa || user.profile?.cgpa || '';

  const hasHq = Boolean((hq || '').trim());
  const hasCollege = Boolean((college || '').trim());
  const hasDegree = Boolean((degree || '').trim());
  const hasSpec = Boolean((spec || '').trim());
  const hasGradYear = Boolean((gradYear || '').trim());
  const hasCgpa = Boolean((cgpa || '').trim());

  const eduCompleted = (hasHq ? 5 : 0) + (hasCollege ? 5 : 0) + (hasDegree ? 4 : 0) + (hasSpec ? 4 : 0) + (hasGradYear ? 4 : 0) + (hasCgpa ? 3 : 0);
  const eduSection = {
    weight: 25,
    completed: eduCompleted,
    percentage: Math.round((eduCompleted / 25) * 100),
    fields: {
      highestQualification: hasHq,
      collegeUniversity: hasCollege,
      degree: hasDegree,
      specialization: hasSpec,
      graduationYear: hasGradYear,
      cgpaPercentage: hasCgpa
    }
  };

  // 4. RESUME = 30%
  // Resume PDF = 30%
  const hasResume = Boolean(
    resume && (resume.fileData || resume.fileName || resume.resume_file?.fileName || resume.resume_file?.data || resume._id)
  );
  const resumeCompleted = hasResume ? 30 : 0;
  const resumeSection = {
    weight: 30,
    completed: resumeCompleted,
    percentage: Math.round((resumeCompleted / 30) * 100),
    fields: {
      resumePdf: hasResume
    }
  };

  // 5. PROFESSIONAL LINKS = 15%
  // LinkedIn = 5%, Portfolio = 5%, Other = 5%
  const links = user.professionalLinks || user.profile?.professionalLinks || {};
  const linkedin = links.linkedin || user.profile?.linkedin || '';
  const portfolio = links.portfolio || user.profile?.portfolio || '';
  const otherLink = links.other || user.profile?.otherLink || user.profile?.other || '';

  const hasLinkedin = Boolean((linkedin || '').trim());
  const hasPortfolio = Boolean((portfolio || '').trim());
  const hasOther = Boolean((otherLink || '').trim());

  const linksCompleted = (hasLinkedin ? 5 : 0) + (hasPortfolio ? 5 : 0) + (hasOther ? 5 : 0);
  const linksSection = {
    weight: 15,
    completed: linksCompleted,
    percentage: Math.round((linksCompleted / 15) * 100),
    fields: {
      linkedin: hasLinkedin,
      portfolio: hasPortfolio,
      other: hasOther
    }
  };

  const totalCompleted = regCompleted + personalCompleted + eduCompleted + resumeCompleted + linksCompleted;
  const progress = Math.min(100, Math.max(0, totalCompleted));

  return {
    progress,
    completedWeight: progress,
    remainingWeight: 100 - progress,
    sections: {
      registration: regSection,
      personal: personalSection,
      education: eduSection,
      resume: resumeSection,
      professionalLinks: linksSection
    }
  };
};

module.exports = { calculateProfileProgress };
