const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

const {
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  getDoctorAppointments,
  rescheduleAppointment,
  updateAppointmentStatus,
} = require('../controllers/appointment.controller');

router.post('/book', protect, bookAppointment);
router.get('/my', protect, getMyAppointments);
router.put('/cancel/:id', protect, cancelAppointment);
router.get('/doctor', protect, getDoctorAppointments);
router.put('/:id/reschedule', protect, rescheduleAppointment);
router.put('/:id/status', protect, authorize('doctor'), updateAppointmentStatus);

module.exports = router;