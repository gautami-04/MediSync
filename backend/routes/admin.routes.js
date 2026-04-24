const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const { getAdminDashboardStats } = require('../controllers/admin.controller');

router.get('/dashboard', protect, authorizeRoles('admin'), getAdminDashboardStats);

module.exports = router;
