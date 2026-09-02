const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const check = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const users = await User.find({ role: { $in: ['student', 'STUDENT'] } }).lean();
    console.log(`Found ${users.length} students:`);
    users.forEach(u => {
      console.log(`ID: ${u._id} | Name: ${u.fullName || u.name} | Email: ${u.email} | StudentID: ${u.studentId || u.student_id}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

check();
