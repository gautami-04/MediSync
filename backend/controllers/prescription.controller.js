const Prescription = require('../models/prescription.model');
const Appointment = require('../models/appointment.model');

// Create Prescription (Doctor Only)
exports.createPrescription = async (req, res) => {
	try {
		const { appointmentId, medications, medicines, advice, notes } = req.body;

		const appointment = await Appointment.findById(appointmentId);
		if (!appointment) {
			return res.status(404).json({ message: 'Appointment not found' });
		}

		if (String(appointment.doctor) !== String(req.user._id)) {
			return res.status(403).json({ message: 'Access denied. You are not the assigned doctor.' });
		}

		// Support both medications (HEAD) and medicines (Improved_admin_UI) formats
		const finalMedications = medications || (medicines ? medicines.map(m => ({
			name: m.name,
			dosage: m.dosage,
			duration: m.duration,
			frequency: '',
			instructions: ''
		})) : []);

		const prescription = await Prescription.create({
			doctor: req.user._id,
			patient: appointment.patient,
			appointment: appointmentId,
			medications: finalMedications,
			advice: advice || '',
			notes: notes || '',
		});

		res.status(201).json(prescription);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Get My Prescriptions (Patient Only)
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

// Get Doctor Prescriptions (Doctor Only)
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

// Get Prescription By ID
exports.getPrescriptionById = async (req, res) => {
	try {
		const prescription = await Prescription.findById(req.params.id)
			.populate('doctor', 'name email')
			.populate('patient', 'name email');

		if (!prescription) {
			return res.status(404).json({ message: 'Prescription not found' });
		}

		// Authorization check
		if (
			prescription.doctor._id.toString() !== req.user._id.toString() &&
			prescription.patient._id.toString() !== req.user._id.toString()
		) {
			return res.status(403).json({ message: 'Access denied' });
		}

		res.json(prescription);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
