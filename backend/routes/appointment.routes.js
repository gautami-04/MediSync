const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');

const {
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  getDoctorAppointments,
} = require('../controllers/appointment.controller');

router.post('/book', protect, bookAppointment);
router.get('/my', protect, getMyAppointments);
router.put('/cancel/:id', protect, cancelAppointment);
router.get('/doctor', protect, getDoctorAppointments);

module.exports = router;