const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const SupportMessage = require('../models/SupportMessage');

const clearInquiries = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_interview_db';
    console.log('Connecting to MongoDB at:', mongoUri);
    await mongoose.connect(mongoUri);

    const result = await SupportMessage.deleteMany({});
    console.log(`Successfully deleted ${result.deletedCount} inquiry message(s) from database.`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error clearing inquiries:', err);
    process.exit(1);
  }
};

clearInquiries();
