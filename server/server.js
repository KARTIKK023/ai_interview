const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config({ path: require('path').join(__dirname, '.env') });

const connectDB = require('./config/db');
const passport = require('passport');
const { errorHandler } = require('./middleware/errorMiddleware');
const enquiryRoutes = require("./routes/enquiryRoutes");

const fs = require('fs');
const path = require('path');

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Connect Database
connectDB();

// Configure Google OAuth strategy (student sign-in)
require('./config/passport');

const app = express();

// Body Parser & CORS (Allow any localhost origin e.g. 5173, 5174, 5175)
// Razorpay webhook needs the RAW body for signature verification, so it is
// mounted BEFORE the global JSON parser.
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  require('./controllers/paymentController').webhook
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1') || origin.startsWith('https://localhost:5000')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(passport.initialize());

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
const supportRoutes = require("./routes/supportRoutes");
const atsRoutes = require('./routes/atsRoutes');

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
app.use("/api/support", supportRoutes);
app.use('/api/ats', atsRoutes);
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use(
  '/api/notifications',
  notificationRoutes
);

app.use(express.json());

app.use("/api/enquiry", enquiryRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'AI Interview Platform API is running' });
});

// Serve the built React client for single-service production deploys.
// Only active when ../client/dist exists, so local Vite dev (port 5173) is untouched.
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[SERVER PORT WARNING] Port ${PORT} is already in use.`);
  } else {
    console.error(`[SERVER ERROR]`, err);
  }
});
