const User = require('../models/User');

/**
 * Generates a unique Student ID in format: STU-YYYY-XXXXX
 * Example: STU-2026-00001
 */
const generateStudentId = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `STU-${currentYear}-`;

  // Find all existing users matching current year prefix
  const studentUsers = await User.find({
    $or: [
      { studentId: new RegExp(`^${prefix}`) },
      { student_id: new RegExp(`^${prefix}`) }
    ]
  }).select('studentId student_id').lean();

  let maxNumber = 0;

  studentUsers.forEach(u => {
    const sId = u.studentId || u.student_id || '';
    const parts = sId.split('-');
    if (parts.length === 3) {
      const seq = parseInt(parts[2], 10);
      if (!isNaN(seq) && seq > maxNumber) {
        maxNumber = seq;
      }
    }
  });

  let nextNumber = maxNumber + 1;
  let candidate = `${prefix}${String(nextNumber).padStart(5, '0')}`;

  // Ensure candidate is strictly unique across all MongoDB records
  while (await User.findOne({ $or: [{ studentId: candidate }, { student_id: candidate }] })) {
    nextNumber++;
    candidate = `${prefix}${String(nextNumber).padStart(5, '0')}`;
  }

  return candidate;
};

module.exports = { generateStudentId };
