const express = require('express');
const router = express.Router();

const protect = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const {
	getAllDoctors,
	getDoctorById,
	getMyDoctorProfile,
	upsertDoctorProfile,
	deleteDoctorProfile,
} = require('../controllers/doctor.controller');

router.get('/', getAllDoctors);
router.get('/profile/me', protect, authorizeRoles('doctor', 'admin'), getMyDoctorProfile);
router.post('/profile', protect, authorizeRoles('doctor', 'admin'), upsertDoctorProfile);
router.put('/profile', protect, authorizeRoles('doctor', 'admin'), upsertDoctorProfile);
router.delete('/profile/:id', protect, authorizeRoles('doctor', 'admin'), deleteDoctorProfile);
router.get('/:id', getDoctorById);

module.exports = router;
