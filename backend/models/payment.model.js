const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
		appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
		amount: { type: Number, required: true, default: 0 },
		currency: { type: String, default: 'INR' },
		method: { type: String, trim: true },
		status: { type: String, enum: ['paid', 'pending', 'failed', 'refunded'], default: 'paid' },
		metadata: { type: Object },
	},
	{ timestamps: true }
);

module.exports = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
