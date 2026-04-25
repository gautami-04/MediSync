const Prescription = require('../models/prescription.model');
const Appointment = require('../models/appointment.model');

exports.createPrescription = async (req, res) => {
	try {
		const { appointmentId, medications, advice } = req.body;

		const appointment = await Appointment.findById(appointmentId);
		if (!appointment) {
			return res.status(404).json({ message: 'Appointment not found' });
		}

		if (String(appointment.doctor) !== String(req.user._id)) {
			return res.status(403).json({ message: 'Access denied. You are not the assigned doctor.' });
		}

		const prescription = await Prescription.create({
			appointment: appointmentId,
			doctor: req.user._id,
			patient: appointment.patient,
			medications,
			advice,
		});

		res.status(201).json(prescription);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

exports.getMyPrescriptions = async (req, res) => {
	try {
		const prescriptions = await Prescription.find({ patient: req.user._id })
			.populate('doctor', 'name email')
			.sort({ createdAt: -1 });
		res.json(prescriptions);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

exports.getDoctorPrescriptions = async (req, res) => {
	try {
		const prescriptions = await Prescription.find({ doctor: req.user._id })
			.populate('patient', 'name email')
			.sort({ createdAt: -1 });
		res.json(prescriptions);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
