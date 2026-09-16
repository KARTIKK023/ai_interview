const User = require('../models/User');

/**
 * requirePermission Middleware
 * Enforces feature-level access for Admin users.
 * Super Admins bypass permission checks with full access.
 */
const requirePermission = (featureKey) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not authenticated' });
      }

      if (req.user.isActive === false) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been deactivated. Contact Super Admin.'
        });
      }

      const roleUpper = (req.user.role || '').toUpperCase();

      // Super Admin has full unrestricted access
      if (roleUpper === 'SUPER_ADMIN') {
        return next();
      }

      // Check Admin permissions array
      if (roleUpper === 'ADMIN') {
        const permissions = req.user.permissions || [];
        
        // If featureKey is 'dashboard', allow if admin has 'dashboard' permission or any permissions assigned
        if (featureKey === 'dashboard' && (permissions.includes('dashboard') || permissions.length > 0)) {
          return next();
        }

        if (permissions.includes(featureKey)) {
          return next();
        }

        return res.status(403).json({
          success: false,
          message: 'You do not have permission to access this feature'
        });
      }

      return res.status(403).json({
        success: false,
        message: 'Access denied. Unauthorized role.'
      });
    } catch (err) {
      console.error('Permission Middleware Error:', err.message);
      return res.status(500).json({ success: false, message: 'Server authorization error' });
    }
  };
};

module.exports = { requirePermission };
