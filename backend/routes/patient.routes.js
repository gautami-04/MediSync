const express = require('express');

const router = express.Router();
const protect = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const {
	getMyPatientProfile,
	upsertPatientProfile,
	getPatientDashboard,
} = require('../controllers/patient.controller');

router.get('/me', protect, authorizeRoles('patient'), getMyPatientProfile);
router.put('/me', protect, authorizeRoles('patient'), upsertPatientProfile);
router.get('/dashboard', protect, authorizeRoles('patient'), getPatientDashboard);

module.exports = router;
