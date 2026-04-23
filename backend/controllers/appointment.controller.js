const Appointment = require('../models/appointment.model');
const { createNotification } = require('../services/notification.service');

//book appointment
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;

    const exists = await Appointment.findOne({
      doctor: doctorId,
      date,
      time,
    });

    if (exists) {
      return res.status(400).json({ message: 'Slot already booked' });
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      date,
      time,
    });

    await createNotification({
      recipient: doctorId,
      type: 'appointment',
      title: 'New Appointment Booked',
      message: `A new appointment has been booked for ${date} at ${time}.`,
      data: { appointmentId: appointment._id }
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Get My Appointments
exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patient: req.user._id,
    }).populate('doctor', 'name email');

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Cancel Appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Not found' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    await createNotification({
      recipient: appointment.doctor,
      type: 'appointment',
      title: 'Appointment Cancelled',
      message: `Appointment on ${appointment.date} at ${appointment.time} has been cancelled.`,
      data: { appointmentId: appointment._id }
    });

    await createNotification({
      recipient: appointment.patient,
      type: 'appointment',
      title: 'Appointment Cancelled',
      message: `Your appointment on ${appointment.date} at ${appointment.time} has been cancelled.`,
      data: { appointmentId: appointment._id }
    });

    res.json({ message: 'Appointment cancelled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Doctor View Appointments
exports.getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      doctor: req.user._id,
    }).populate('patient', 'name email');

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reschedule Appointment
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { date, time, reason } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const isPatient = appointment.patient.toString() === req.user._id.toString();
    const isDoctor = appointment.doctor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if new slot is already booked
    const exists = await Appointment.findOne({
      doctor: appointment.doctor,
      date,
      time,
      status: { $ne: 'cancelled' },
      _id: { $ne: appointment._id }
    });

    if (exists) {
      return res.status(400).json({ message: 'Requested slot is already booked' });
    }

    if (date) appointment.date = date;
    if (time) appointment.time = time;
    if (reason) appointment.rescheduleReason = reason;
    appointment.status = 'rescheduled';
    await appointment.save();

    const recipient = isPatient ? appointment.doctor : appointment.patient;
    await createNotification({
      recipient,
      type: 'appointment',
      title: 'Appointment Rescheduled',
      message: `Appointment rescheduled to ${appointment.date} at ${appointment.time}.`,
      data: { appointmentId: appointment._id }
    });

    res.json({ message: 'Appointment rescheduled successfully', appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Appointment Status (Doctor Only)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status, notes, diagnosis } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verify ownership
    if (appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (status) appointment.status = status;
    if (notes) appointment.notes = notes;
    if (diagnosis) appointment.diagnosis = diagnosis;

    await appointment.save();

    // Notify patient about status change
    await createNotification({
      recipient: appointment.patient,
      type: 'appointment',
      title: 'Appointment Updated',
      message: `Your appointment status has been updated to ${appointment.status}.`,
      data: { appointmentId: appointment._id }
    });

    res.json({ message: 'Appointment updated successfully', appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};