const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
	{
		patient: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		doctor: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		diagnosis: {
			type: String,
			required: true,
			trim: true,
		},
		symptoms: {
			type: String,
			trim: true,
		},
		prescription: {
			type: String,
			trim: true,
		},
		notes: {
			type: String,
			trim: true,
		},
		visitDate: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true }
);

medicalRecordSchema.index({ patient: 1, visitDate: -1 });
medicalRecordSchema.index({ doctor: 1, visitDate: -1 });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
