const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

const fs = require('fs');
const path = require('path');

dotenv.config();

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Connect Database
connectDB();

const app = express();

// Body Parser & CORS (Allow any localhost origin e.g. 5173, 5174, 5175)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Route Files
const authRoutes = require('./routes/authRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const questionRoutes = require('./routes/questionRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const aiRoutes = require('./routes/aiRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const jobRoleRoutes = require('./routes/jobRoleRoutes');
const targetJobRoutes = require('./routes/targetJobRoutes');
const profileRoutes = require('./routes/profileRoutes');
const placementRoutes = require('./routes/placementRoutes');
const locationRoutes = require('./routes/locationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const askRoutes = require('./routes/askRoutes');

// Mount Routers
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/job-roles', jobRoleRoutes);
app.use('/api/target-jobs', targetJobRoutes);
app.use('/api/placement-opportunities', placementRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/ask', askRoutes);
app.use(
  '/api/notifications',
  notificationRoutes
);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'AI Interview Platform API is running' });
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[SERVER PORT WARNING] Port ${PORT} is already in use.`);
  } else {
    console.error(`[SERVER ERROR]`, err);
  }
});
