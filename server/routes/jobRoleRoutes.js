const express = require('express');
const router = express.Router();
const { getActiveJobRoles } = require('../controllers/jobRoleController');

router.get('/', getActiveJobRoles);

module.exports = router;
