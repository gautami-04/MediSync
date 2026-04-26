const Payment = require('../models/payment.model');
const Appointment = require('../models/appointment.model');

// Helper to generate a unique reference ID
const generateReferenceId = () => {
  return 'PAY-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// Create a payment record
const createPayment = async (req, res) => {
  try {
    const { 
      amount, 
      currency = 'INR', 
      method = 'card', 
      appointmentId, 
      patient, 
      metadata, 
      status = 'pending',
      doctorName,
      specialty,
      notes
    } = req.body;

    if (amount === undefined || amount === null || Number(amount) <= 0) {
      return res.status(400).json({ message: 'A valid amount is required' });
    }

    const payload = {
      user: req.user._id,
      patient: patient || req.user._id,
      amount: Number(amount),
      currency,
      method,
      status,
      metadata,
      notes: notes || '',
      referenceId: generateReferenceId(),
      paidAt: status === 'paid' ? new Date() : null,
    };

    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId).populate({ path: 'doctor', populate: { path: 'user', select: 'name' } });

      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      // Check if the user is the patient of the appointment or an admin
      if (String(appointment.patient) !== String(req.user._id) && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Cannot create payment for this appointment' });
      }

      payload.appointment = appointment._id;
      payload.doctor = appointment.doctor?._id || appointment.doctor;
      payload.doctorName = doctorName || appointment.doctor?.user?.name || appointment.doctor?.name || '';
      payload.specialty = specialty || (appointment.doctor?.specialization || '');
    } else {
      payload.doctorName = doctorName || '';
      payload.specialty = specialty || '';
    }

    const payment = await Payment.create(payload);
    return res.status(201).json(payment);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get payments for the authenticated user / patient
const getMyPayments = async (req, res) => {
  try {
    const Patient = require('../models/patient.model');
    const Doctor = require('../models/doctor.model');
    const Appointment = require('../models/appointment.model');

    let query = {};

    if (req.user.role === 'patient') {
      const patientProfile = await Patient.findOne({ user: req.user._id });
      if (patientProfile) {
        query = { patient: patientProfile._id };
      } else {
        query = { user: req.user._id }; // Fallback
      }
    } else if (req.user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ user: req.user._id });
      if (doctorProfile) {
        // Include payments directly linked to doctor OR linked via appointments
        const doctorAppointments = await Appointment.find({ doctor: doctorProfile._id }).distinct('_id');
        query = { 
          $or: [
            { doctor: doctorProfile._id }, 
            { appointment: { $in: doctorAppointments } }
          ] 
        };
      }
    } else if (req.user.role === 'admin') {
      query = {}; // Admin sees all if using this endpoint
    }

    const payments = await Payment.find(query)
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name email' }
      })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email' }
      })
      .populate({
        path: 'appointment',
        populate: { path: 'doctor', populate: { path: 'user', select: 'name' } }
      })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // Map to ensure doctorName is populated from relations if missing in field
    const formattedPayments = payments.map(p => ({
      ...p,
      doctorName: p.doctorName || p.doctor?.user?.name || p.appointment?.doctor?.user?.name || 'MediSync Practitioner',
      patient: { 
        ...p.patient, 
        user: { 
          name: p.patient?.user?.name || 'MediSync Patient' 
        } 
      }
    }));

    return res.status(200).json(formattedPayments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPayment,
  getMyPayments,
};
