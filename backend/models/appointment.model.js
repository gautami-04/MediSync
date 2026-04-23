const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: String,
    time: String,
    status: {
      type: String,
      enum: ['booked', 'cancelled', 'completed', 'rescheduled'],
      default: 'booked',
    },
    notes: { type: String, default: '' },
    diagnosis: { type: String, default: '' },
    rescheduleReason: { type: String, default: '' },
  },
  { timestamps: true }
);

appointmentSchema.index({ doctor: 1, date: 1, time: 1 }, { unique: true, partialFilterExpression: { status: { $ne: 'cancelled' } } });

module.exports = mongoose.model('Appointment', appointmentSchema);