const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Resume = require('../models/Resume');
const TargetJob = require('../models/TargetJob');
const Interview = require('../models/Interview');
const Answer = require('../models/Answer');
const Evaluation = require('../models/Evaluation');

const runUpdate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected Successfully.');

    // 1. Delete Alex Student user & related data
    const alexUser = await User.findOne({
      $or: [
        { email: 'student@aiinterview.com' },
        { fullName: /Alex Student/i },
        { name: /Alex Student/i }
      ]
    });

    if (alexUser) {
      const alexId = alexUser._id;
      console.log(`Deleting Alex Student user (ID: ${alexId}, Email: ${alexUser.email})...`);

      await Interview.deleteMany({ candidateId: alexId });
      await Answer.deleteMany({ candidateId: alexId });
      await Evaluation.deleteMany({ candidateId: alexId });
      await Resume.deleteMany({ $or: [{ userId: alexId }, { studentId: alexUser.studentId }] });
      await TargetJob.deleteMany({ userId: alexId });
      await User.findByIdAndDelete(alexId);

      console.log('Alex Student record and associated data deleted successfully.');
    } else {
      console.log('Alex Student user record not found or already deleted.');
    }

    // 2. Update Dheerendra Kumar's Student ID to STU-2026-00001
    const dheerendraUser = await User.findOne({
      $or: [
        { email: 'dheerendrakumar63930@gmail.com' },
        { fullName: /Dheerendra/i },
        { name: /Dheerendra/i }
      ]
    });

    if (dheerendraUser) {
      console.log(`Updating Dheerendra Kumar (ID: ${dheerendraUser._id}) Student ID to STU-2026-00001...`);

      dheerendraUser.studentId = 'STU-2026-00001';
      dheerendraUser.student_id = 'STU-2026-00001';
      await dheerendraUser.save();

      // Also update any Resume records for Dheerendra
      await Resume.updateMany(
        { $or: [{ userId: dheerendraUser._id }, { studentId: 'STU-2026-00002' }, { student_id: 'STU-2026-00002' }] },
        { $set: { studentId: 'STU-2026-00001', student_id: 'STU-2026-00001' } }
      );

      console.log("Dheerendra Kumar's Student ID updated to STU-2026-00001 successfully.");
    } else {
      console.log('Dheerendra Kumar user record not found.');
    }

    console.log('\n===================================================');
    console.log('      DATABASE UPDATE EXECUTED SUCCESSFULLY        ');
    console.log('===================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Update failed:', err);
    process.exit(1);
  }
};

runUpdate();
