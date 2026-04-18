const express = require('express');

const router = express.Router();
const protect = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const {
	createMedicalRecord,
	getMyMedicalRecords,
	getDoctorPatientRecords,
	updateMedicalRecord,
	deleteMedicalRecord,
} = require('../controllers/medicalRecord.controller');

router.post('/', protect, authorizeRoles('doctor'), createMedicalRecord);
router.get('/my', protect, authorizeRoles('patient'), getMyMedicalRecords);
router.get('/doctor', protect, authorizeRoles('doctor'), getDoctorPatientRecords);
router.patch('/:id', protect, authorizeRoles('doctor'), updateMedicalRecord);
router.delete('/:id', protect, authorizeRoles('doctor', 'admin'), deleteMedicalRecord);

module.exports = router;
