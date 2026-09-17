const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const SuperAdmin = require('../models/SuperAdmin');

/**
 * Super Admin Auth Middleware
 * Verifies JWT token and checks if user is SUPER_ADMIN
 */
const protectSuperAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ai_interview_secret_key_2026_super_secure');

      const user = await SuperAdmin.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({ success: false, message: 'Admin account not found' });
      }

      if (user.isActive === false) {
        return res.status(403).json({ success: false, message: 'Your admin account has been deactivated. Contact Super Admin.' });
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

/**
 * Admin / Super Admin Auth Middleware
 * Verifies JWT token and checks if user is SUPER_ADMIN or ADMIN
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

      let user = await SuperAdmin.findById(decoded.id).select('-password');
      if (!user) user = await Role.findOne({ _id: decoded.id, role: { $in: ['admin', 'ADMIN'] } }).select('-password');

      if (!user) {
        return res.status(401).json({ success: false, message: 'Admin account not found' });
      }

      if (user.isActive === false) {
        return res.status(403).json({ success: false, message: 'Your admin account has been deactivated. Contact Super Admin.' });
      }

      const roleUpper = (user.role || '').toUpperCase();
      if (roleUpper !== 'SUPER_ADMIN' && roleUpper !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.'
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error('Admin Auth Middleware Error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

module.exports = { protectAdmin, protectSuperAdmin };
