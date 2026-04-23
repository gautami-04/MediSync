const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

// All routes require admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/users', adminController.getAllUsers);
router.get('/doctors', adminController.getAllDoctors);
router.put('/doctors/:id/approve', adminController.approveDoctor);
router.put('/doctors/:id/reject', adminController.rejectDoctor);
router.get('/appointments', adminController.getAllAppointments);
router.get('/payment-stats', adminController.getPaymentStats);

module.exports = router;
