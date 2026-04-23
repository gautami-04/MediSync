const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescription.controller');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

router.post(
	'/',
	protect,
	authorize('doctor'),
	prescriptionController.createPrescription
);

router.get(
	'/my',
	protect,
	authorize('patient'),
	prescriptionController.getMyPrescriptions
);

router.get(
	'/doctor',
	protect,
	authorize('doctor'),
	prescriptionController.getDoctorPrescriptions
);

router.get('/:id', protect, prescriptionController.getPrescriptionById);

module.exports = router;
