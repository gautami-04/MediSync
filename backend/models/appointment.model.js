const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: String,
  time: String,
 status: {
  type: String,
  enum: ['booked', 'cancelled', 'completed'],
  default: 'booked',
},
});

module.exports = mongoose.model('Appointment', appointmentSchema);