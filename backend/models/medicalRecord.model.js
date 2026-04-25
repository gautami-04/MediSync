const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema(
	{
		medicineName: { type: String, trim: true, required: true },
		dosage: { type: String, trim: true, default: '' },
		frequency: { type: String, trim: true, default: '' },
		duration: { type: String, trim: true, default: '' },
	},
	{ _id: true }
);

const medicalRecordSchema = new mongoose.Schema(
	{
		patient: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		doctor: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Doctor',
			required: true,
			index: true,
		},
		appointment: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Appointment',
			required: true,
			index: true,
		},
		title: { type: String, trim: true, required: true, maxlength: 120 },
		diagnosis: { type: String, trim: true, default: '' },
		symptoms: [{ type: String, trim: true }],
		medications: [medicationSchema],
		testsRecommended: [{ type: String, trim: true }],
		notes: { type: String, trim: true, maxlength: 3000, default: '' },
		attachments: [{ type: String, trim: true }],
	},
	{ timestamps: true }
);

medicalRecordSchema.index({ patient: 1, createdAt: -1 });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
