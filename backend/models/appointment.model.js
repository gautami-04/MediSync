const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    reason: { type: String, trim: true, default: '' },
    consultationFee: { type: Number, min: 0, default: 0 },
    notes: { type: String, trim: true, default: '' },
    diagnosis: { type: String, default: '' },
    rescheduleReason: { type: String, default: '' },
    status: {
      type: String,
      enum: ['booked', 'confirmed', 'completed', 'cancelled', 'rescheduled'],
      default: 'booked',
    },
    paymentMode: {
      type: String,
      enum: ['prepaid', 'pay_later'],
      default: 'prepaid',
    },
  },
  { timestamps: true }
);

appointmentSchema.index({ doctor: 1, date: 1, time: 1 }, { unique: true, partialFilterExpression: { status: { $ne: 'cancelled' } } });

module.exports = mongoose.model('Appointment', appointmentSchema);