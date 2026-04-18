const MedicalRecord = require('../models/medicalRecord.model');

exports.createMedicalRecord = async (req, res) => {
	try {
		const { patientId, diagnosis, symptoms, prescription, notes, visitDate } = req.body;

		if (!patientId || !diagnosis) {
			return res.status(400).json({ message: 'patientId and diagnosis are required' });
		}

		const record = await MedicalRecord.create({
			patient: patientId,
			doctor: req.user._id,
			diagnosis,
			symptoms,
			prescription,
			notes,
			visitDate,
		});

		const populatedRecord = await MedicalRecord.findById(record._id)
			.populate('patient', 'name email role')
			.populate('doctor', 'name email role');

		return res.status(201).json(populatedRecord);
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

exports.getMyPatientMedicalRecords = async (req, res) => {
	try {
		const records = await MedicalRecord.find({ patient: req.user._id })
			.sort({ visitDate: -1 })
			.populate('doctor', 'name email role');

		return res.json(records);
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

exports.getMyDoctorMedicalRecords = async (req, res) => {
	try {
		const records = await MedicalRecord.find({ doctor: req.user._id })
			.sort({ visitDate: -1 })
			.populate('patient', 'name email role');

		return res.json(records);
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

exports.getMedicalRecordById = async (req, res) => {
	try {
		const record = await MedicalRecord.findById(req.params.id)
			.populate('patient', 'name email role')
			.populate('doctor', 'name email role');

		if (!record) {
			return res.status(404).json({ message: 'Medical record not found' });
		}

		const isOwnerPatient = record.patient._id.toString() === req.user._id.toString();
		const isOwnerDoctor = record.doctor._id.toString() === req.user._id.toString();
		const isAdmin = req.user.role === 'admin';

		if (!isOwnerPatient && !isOwnerDoctor && !isAdmin) {
			return res.status(403).json({ message: 'Access denied' });
		}

		return res.json(record);
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

exports.updateMedicalRecord = async (req, res) => {
	try {
		const { diagnosis, symptoms, prescription, notes, visitDate } = req.body;
		const record = await MedicalRecord.findById(req.params.id);

		if (!record) {
			return res.status(404).json({ message: 'Medical record not found' });
		}

		const isOwnerDoctor = record.doctor.toString() === req.user._id.toString();
		const isAdmin = req.user.role === 'admin';

		if (!isOwnerDoctor && !isAdmin) {
			return res.status(403).json({ message: 'Access denied' });
		}

		if (diagnosis !== undefined) record.diagnosis = diagnosis;
		if (symptoms !== undefined) record.symptoms = symptoms;
		if (prescription !== undefined) record.prescription = prescription;
		if (notes !== undefined) record.notes = notes;
		if (visitDate !== undefined) record.visitDate = visitDate;

		await record.save();

		const populatedRecord = await MedicalRecord.findById(record._id)
			.populate('patient', 'name email role')
			.populate('doctor', 'name email role');

		return res.json(populatedRecord);
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

exports.deleteMedicalRecord = async (req, res) => {
	try {
		const record = await MedicalRecord.findById(req.params.id);

		if (!record) {
			return res.status(404).json({ message: 'Medical record not found' });
		}

		const isOwnerDoctor = record.doctor.toString() === req.user._id.toString();
		const isAdmin = req.user.role === 'admin';

		if (!isOwnerDoctor && !isAdmin) {
			return res.status(403).json({ message: 'Access denied' });
		}

		await record.deleteOne();
		return res.json({ message: 'Medical record deleted' });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};
