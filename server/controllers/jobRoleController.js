const JobRole = require('../models/JobRole');

// @desc    Get active job roles
// @route   GET /api/job-roles
// @access  Public / Private
const getActiveJobRoles = async (req, res, next) => {
  try {
    const rolesDocs = await JobRole.find({ isActive: true }).sort({ category: 1, roleName: 1, name: 1 });
    
    // Format roles ensuring roleName is set
    const roles = rolesDocs.map((r) => ({
      _id: r._id,
      roleName: r.roleName || r.name || '',
      category: r.category || 'Other',
      isActive: r.isActive
    }));

    return res.json({
      success: true,
      count: roles.length,
      roles
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getActiveJobRoles
};
