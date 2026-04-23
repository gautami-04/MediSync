const Appointment = require('../models/appointment.model');

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

    // Check if new slot is already booked
    const exists = await Appointment.findOne({
      doctor: appointment.doctor,
      date,
      time,
      status: { $ne: 'cancelled' },
    });

    if (exists) {
      return res.status(400).json({ message: 'Requested slot is already booked' });
    }

    appointment.date = date;
    appointment.time = time;
    appointment.rescheduleReason = reason;
    appointment.status = 'rescheduled';
    await appointment.save();

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
    res.json({ message: 'Appointment updated successfully', appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};