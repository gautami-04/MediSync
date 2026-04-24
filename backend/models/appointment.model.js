const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    date: { type: String, required: true },
    time: { type: String, required: true },
    reason: { type: String, trim: true, default: '' },
    consultationFee: { type: Number, min: 0, default: 0 },
    notes: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['booked', 'confirmed', 'completed', 'cancelled', 'rescheduled'],
      default: 'booked',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);