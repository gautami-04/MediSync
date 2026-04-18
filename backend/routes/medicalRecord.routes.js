const express = require('express');
const router = express.Router();

const protect = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const {
	createMedicalRecord,
	getMyPatientMedicalRecords,
	getMyDoctorMedicalRecords,
	getMedicalRecordById,
	updateMedicalRecord,
	deleteMedicalRecord,
} = require('../controllers/medicalRecord.controller');

router.post('/', protect, authorizeRoles('doctor', 'admin'), createMedicalRecord);
router.get('/my', protect, authorizeRoles('patient'), getMyPatientMedicalRecords);
router.get('/doctor/my', protect, authorizeRoles('doctor', 'admin'), getMyDoctorMedicalRecords);
router.get('/:id', protect, getMedicalRecordById);
router.put('/:id', protect, authorizeRoles('doctor', 'admin'), updateMedicalRecord);
router.delete('/:id', protect, authorizeRoles('doctor', 'admin'), deleteMedicalRecord);

module.exports = router;
