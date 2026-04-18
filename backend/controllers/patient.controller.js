const mongoose = require('mongoose');
let Patient = require('../models/patient.model');
const Appointment = require('../models/appointment.model');
const MedicalRecord = require('../models/medicalRecord.model');
const User = require('../models/user.model');

// Fallback model so controller can still run if patient.model.js is not implemented yet.
if (!Patient || typeof Patient.findOne !== 'function') {
	const patientSchema = new mongoose.Schema(
		{
			user: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
				required: true,
				unique: true,
			},
			phone: { type: String, trim: true },
			gender: {
				type: String,
				enum: ['male', 'female', 'other', 'prefer_not_to_say'],
			},
			dateOfBirth: { type: Date },
			bloodGroup: { type: String, trim: true },
			allergies: [{ type: String, trim: true }],
			chronicConditions: [{ type: String, trim: true }],
			emergencyContactName: { type: String, trim: true },
			emergencyContactPhone: { type: String, trim: true },
			address: { type: String, trim: true },
		},
		{ timestamps: true }
	);

	Patient = mongoose.models.Patient || mongoose.model('Patient', patientSchema);
}

const getAppointmentDoctorPopulate = () => {
	const doctorPath = Appointment.schema.path('doctor');
	const doctorRef = doctorPath?.options?.ref;

	if (doctorRef === 'Doctor') {
		return {
			path: 'doctor',
			populate: { path: 'user', select: 'name email' },
		};
	}

	return { path: 'doctor', select: 'name email' };
};

const getMedicalRecordDoctorPopulate = () => {
	const doctorPath = MedicalRecord.schema.path('doctor');
	const doctorRef = doctorPath?.options?.ref;

	if (doctorRef === 'Doctor') {
		return {
			path: 'doctor',
			populate: { path: 'user', select: 'name email' },
		};
	}

	return { path: 'doctor', select: 'name email' };
};

const toValidDate = (value) => {
	if (!value) return null;
	const parsed = new Date(value);
	return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getAppointmentDate = (appointment) => {
	if (appointment?.scheduledAt) {
		const scheduledAt = toValidDate(appointment.scheduledAt);
		if (scheduledAt) return scheduledAt;
	}

	if (appointment?.date && appointment?.time) {
		const withTime = toValidDate(`${appointment.date} ${appointment.time}`);
		if (withTime) return withTime;
	}

	if (appointment?.date) {
		const dateOnly = toValidDate(appointment.date);
		if (dateOnly) return dateOnly;
	}

	if (appointment?.createdAt) {
		const createdAt = toValidDate(appointment.createdAt);
		if (createdAt) return createdAt;
	}

	if (appointment?._id && typeof appointment._id.getTimestamp === 'function') {
		return appointment._id.getTimestamp();
	}

	return new Date(0);
};

const getOrCreatePatient = async (userId) => {
	const patient = await Patient.findOneAndUpdate(
		{ user: userId },
		{ $setOnInsert: { user: userId } },
		{ new: true, upsert: true, setDefaultsOnInsert: true }
	);

	return patient;
};

const getMyPatientProfile = async (req, res) => {
	try {
		const patient = await getOrCreatePatient(req.user._id);
		const populated = await Patient.findById(patient._id).populate('user', 'name email');
		return res.status(200).json(populated);
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const upsertPatientProfile = async (req, res) => {
	try {
		const allowedFields = [
			'phone',
			'gender',
			'dateOfBirth',
			'bloodGroup',
			'allergies',
			'chronicConditions',
			'emergencyContactName',
			'emergencyContactPhone',
			'address',
		];

		const updateData = {};
		for (const key of allowedFields) {
			if (req.body[key] !== undefined) {
				updateData[key] = req.body[key];
			}
		}

		const patient = await Patient.findOneAndUpdate(
			{ user: req.user._id },
			{ $set: updateData, $setOnInsert: { user: req.user._id } },
			{ new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
		).populate('user', 'name email');

		return res.status(200).json({ message: 'Patient profile updated', patient });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const getPatientDashboard = async (req, res) => {
	try {
		const patient = await getOrCreatePatient(req.user._id);
		const now = new Date();
		const patientRefs = [req.user._id, patient._id];

		const [appointments, recentRecords, user] = await Promise.all([
			Appointment.find({ patient: { $in: patientRefs } })
				.populate(getAppointmentDoctorPopulate())
				.lean(),
			MedicalRecord.find({ patient: { $in: patientRefs } })
				.sort({ createdAt: -1 })
				.limit(5)
				.populate(getMedicalRecordDoctorPopulate())
				.lean(),
			User.findById(req.user._id).lean(),
		]);

		const totalAppointments = appointments.length;
		const completedAppointments = appointments.filter(
			(item) => item.status === 'completed'
		).length;
		const upcomingAppointments = appointments.filter((item) => {
			const status = item.status || 'booked';
			if (!['booked', 'rescheduled'].includes(status)) return false;

			const scheduledTime = getAppointmentDate(item);
			return scheduledTime >= now;
		}).length;

		const recentAppointments = [...appointments]
			.sort((a, b) => getAppointmentDate(b) - getAppointmentDate(a))
			.slice(0, 5);

		const unreadNotifications =
			user?.notifications?.filter((item) => !item.isRead).length || 0;

		return res.status(200).json({
			summary: {
				totalAppointments,
				upcomingAppointments,
				completedAppointments,
				medicalRecords: recentRecords.length,
				unreadNotifications,
			},
			recentAppointments,
			recentRecords,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

module.exports = {
	getMyPatientProfile,
	upsertPatientProfile,
	getPatientDashboard,
};
