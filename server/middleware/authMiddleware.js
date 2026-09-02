const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ai_interview_secret_key_2026_super_secure');

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User account not found' });
      }
      if (!req.user.isActive) {
        return res.status(403).json({ success: false, message: 'Account is deactivated' });
      }

      // Check HireSmart AI Service Access Status
      const statusStr = (req.user.serviceStatus || 'Active').toLowerCase();
      if (statusStr.includes('inactive')) {
        return res.status(403).json({
          success: false,
          isServiceInactive: true,
          message: 'Your HireSmart AI service access is currently inactive. Please contact your Super Admin to reactivate access.'
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
