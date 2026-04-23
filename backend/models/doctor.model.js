const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  day: { 
    type: String, 
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true 
  },
  startTime: { type: String, required: true }, // e.g. "09:00"
  endTime: { type: String, required: true },   // e.g. "10:00"
  isBooked: { type: Boolean, default: false }
}, { _id: true }); // Keep _id so Gautami can reference specific slots easily

const doctorSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			unique: true,
		},
		specialization: { type: String, required: true },
		qualification: { type: String, required: true },
		experienceYears: { type: Number, required: true },
		consultationFee: { type: Number, required: true },
		hospital: { type: String, required: true },
		address: {
			street: String,
			city: String,
			state: String,
			zipCode: String
		},
		bio: String,
		availableSlots: [slotSchema], // Using the named schema here
		isApproved: { type: Boolean, default: false },
		approvedAt: Date,
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
