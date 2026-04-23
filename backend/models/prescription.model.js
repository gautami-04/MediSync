const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema(
	{
		doctor: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		patient: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		appointment: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Appointment',
		},
		medicines: [
			{
				name: { type: String, required: true },
				dosage: { type: String, required: true },
				duration: { type: String, required: true },
			},
		],
		notes: { type: String },
		issuedAt: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
