const Payment = require('../models/payment.model');

// Create a payment record
const createPayment = async (req, res) => {
  try {
    const { amount, currency, method, appointment, patient, metadata, status } = req.body;

    if (amount === undefined || amount === null) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    const payment = await Payment.create({
      user: req.user._id,
      patient: patient || req.user._id,
      appointment,
      amount,
      currency: currency || 'USD',
      method,
      status: status || 'paid',
      metadata,
    });

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
