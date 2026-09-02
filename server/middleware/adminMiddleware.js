const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Super Admin Auth Middleware
 * Verifies JWT token and checks if the authenticated user has role === 'SUPER_ADMIN'
 */
const protectAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ai_interview_secret_key_2026_super_secure');

      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({ success: false, message: 'Admin account not found' });
      }

      if (!user.isActive) {
        return res.status(403).json({ success: false, message: 'Account is deactivated' });
      }

      const roleUpper = (user.role || '').toUpperCase();
      if (roleUpper !== 'SUPER_ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Super Admin privileges required.'
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error('Super Admin Auth Middleware Error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

module.exports = { protectAdmin };
