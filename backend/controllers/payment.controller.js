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
      const appointment = await Appointment.findById(appointmentId).populate('doctor', 'name');

      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      // Check if the user is the patient of the appointment or an admin
      if (String(appointment.patient) !== String(req.user._id) && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Cannot create payment for this appointment' });
      }

      payload.appointment = appointment._id;
      payload.doctorName = doctorName || appointment.doctor?.name || '';
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
    const payments = await Payment.find({ $or: [{ patient: req.user._id }, { user: req.user._id }] })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.status(200).json(payments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPayment,
  getMyPayments,
};
