const Appointment = require('../models/appointment.model');
const Doctor = require('../models/doctor.model');
const { createNotification } = require('../services/notification.service');

// Book appointment (patient)
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;

    if (!date || !time) {
      return res.status(400).json({ message: 'Date and time are required' });
    }

    if (!doctorId) {
      return res.status(400).json({ message: 'Please select a doctor' });
    }

    // Check for slot conflict
    const exists = await Appointment.findOne({
      doctor: doctorId,
      date,
      time,
      status: { $nin: ['cancelled'] },
    });

    if (exists) {
      return res.status(400).json({ message: 'This slot is already booked. Please choose a different time.' });
    }

    // Get the doctor's consultation fee
    let consultationFee = 0;
    const doctorProfile = await Doctor.findById(doctorId);
    if (doctorProfile) {
      consultationFee = doctorProfile.consultationFee || 0;
    }

    const patientId = req.user._id;

    // Check if patient already has an appointment at this time
    const patientConflict = await Appointment.findOne({
      patient: patientId,
      date,
      time,
      status: { $ne: 'cancelled' }
    });

    if (patientConflict) {
      return res.status(400).json({ message: 'You already have an appointment at this time' });
    }

    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      date,
      time,
      reason: reason || '',
      consultationFee,
    });

    const populated = await Appointment.findById(appointment._id)
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email' },
      })
      .populate('patient', 'name email');

    await createNotification({
      recipient: doctorId,
      type: 'appointment',
      title: 'New Appointment Booked',
      message: `A new appointment has been booked for ${date} at ${time}.`,
      data: { appointmentId: appointment._id }
    });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get my appointments (patient)
exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patient: req.user._id,
    })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email' },
      })
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel appointment (patient or admin)
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'Appointment is already cancelled' });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel a completed appointment' });
    }

    // Verify ownership (Patient or Doctor)
    const isPatient = appointment.patient.toString() === req.user._id.toString();
    const isDoctor = appointment.doctor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    const populated = await Appointment.findById(appointment._id)
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email' },
      })
      .populate('patient', 'name email');

    if (isPatient) {
      await createNotification({
        recipient: appointment.doctor,
        type: 'appointment',
        title: 'Appointment Cancelled',
        message: `Appointment on ${appointment.date} at ${appointment.time} has been cancelled.`,
        data: { appointmentId: appointment._id }
      });
    } else if (isDoctor) {
      await createNotification({
        recipient: appointment.patient,
        type: 'appointment',
        title: 'Appointment Cancelled',
        message: `Your appointment on ${appointment.date} at ${appointment.time} has been cancelled.`,
        data: { appointmentId: appointment._id }
      });
    }

    res.json({ message: 'Appointment cancelled', appointment: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get doctor's appointments
exports.getDoctorAppointments = async (req, res) => {
  try {
    const doctorProfile = await Doctor.findOne({ user: req.user._id });

    if (!doctorProfile) {
      return res.json([]);
    }

    const appointments = await Appointment.find({
      doctor: doctorProfile._id,
    })
      .populate('patient', 'name email')
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update appointment status (doctor / admin)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status, notes, diagnosis } = req.body;
    const validStatuses = ['confirmed', 'completed', 'cancelled', 'rescheduled'];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verify ownership
    const isDoctor = appointment.doctor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isDoctor && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Prevent invalid transitions
    if (status && appointment.status === 'completed' && status !== 'completed') {
      return res.status(400).json({ message: 'Cannot change status of a completed appointment' });
    }

    if (status && appointment.status === 'cancelled' && status !== 'cancelled') {
      return res.status(400).json({ message: 'Cannot change status of a cancelled appointment' });
    }

    if (status) appointment.status = status;
    if (notes) appointment.notes = notes;
    if (diagnosis) appointment.diagnosis = diagnosis;

    await appointment.save();

    const populated = await Appointment.findById(appointment._id)
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email' },
      })
      .populate('patient', 'name email');

    // Notify patient about status change
    await createNotification({
      recipient: appointment.patient,
      type: 'appointment',
      title: 'Appointment Updated',
      message: `Your appointment status has been updated.`,
      data: { appointmentId: appointment._id }
    });

    res.json({ message: `Appointment updated successfully`, appointment: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reschedule appointment
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { date, time, reason } = req.body;

    if (!date || !time) {
      return res.status(400).json({ message: 'New date and time are required' });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Only patient who owns it, or doctor/admin, can reschedule
    const isPatient = appointment.patient.toString() === req.user._id.toString();
    const isDoctor = appointment.doctor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot reschedule a completed or cancelled appointment' });
    }

    // Check for slot conflict with new time
    const conflict = await Appointment.findOne({
      _id: { $ne: appointment._id },
      doctor: appointment.doctor,
      date,
      time,
      status: { $nin: ['cancelled'] },
    });

    if (conflict) {
      return res.status(400).json({ message: 'The new time slot is already booked' });
    }

    appointment.date = date;
    appointment.time = time;
    if (reason) appointment.rescheduleReason = reason;
    appointment.status = 'rescheduled';
    await appointment.save();

    const populated = await Appointment.findById(appointment._id)
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email' },
      })
      .populate('patient', 'name email');

    const recipient = isPatient ? appointment.doctor : appointment.patient;
    await createNotification({
      recipient,
      type: 'appointment',
      title: 'Appointment Rescheduled',
      message: `Appointment rescheduled to ${appointment.date} at ${appointment.time}.`,
      data: { appointmentId: appointment._id }
    });

    res.json({ message: 'Appointment rescheduled successfully', appointment: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all appointments (admin)
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email' },
      })
      .populate('patient', 'name email')
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
