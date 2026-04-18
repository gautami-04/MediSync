const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema(
	{
		day: {
			type: String,
			enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
			required: true,
		},
		from: { type: String, required: true },
		to: { type: String, required: true },
	},
	{ _id: false }
);

const doctorSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			unique: true,
		},
		specialization: { type: String, required: true, trim: true },
		qualification: { type: String, trim: true },
		experienceYears: { type: Number, min: 0, default: 0 },
		consultationFee: { type: Number, min: 0, default: 0 },
		hospital: { type: String, trim: true },
		bio: { type: String, trim: true },
		availableSlots: [slotSchema],
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
