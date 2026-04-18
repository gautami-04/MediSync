const Doctor = require('../models/doctor.model');

const getAllDoctors = async (req, res) => {
	try {
		const doctors = await Doctor.find().populate('user', 'name email role');
		res.json(doctors);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const getDoctorById = async (req, res) => {
	try {
		const doctor = await Doctor.findById(req.params.id).populate('user', 'name email role');

		if (!doctor) {
			return res.status(404).json({ message: 'Doctor not found' });
		}

		res.json(doctor);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const getMyDoctorProfile = async (req, res) => {
	try {
		const doctor = await Doctor.findOne({ user: req.user._id }).populate('user', 'name email role');

		if (!doctor) {
			return res.status(404).json({ message: 'Doctor profile not found' });
		}

		res.json(doctor);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const upsertDoctorProfile = async (req, res) => {
	try {
		const {
			specialization,
			qualification,
			experienceYears,
			consultationFee,
			hospital,
			bio,
			availableSlots,
		} = req.body;

		if (!specialization) {
			return res.status(400).json({ message: 'Specialization is required' });
		}

		const payload = {
			user: req.user._id,
			specialization,
			qualification,
			experienceYears,
			consultationFee,
			hospital,
			bio,
			availableSlots,
		};

		const doctor = await Doctor.findOneAndUpdate(
			{ user: req.user._id },
			payload,
			{
				new: true,
				upsert: true,
				runValidators: true,
				setDefaultsOnInsert: true,
			}
		).populate('user', 'name email role');

		res.status(200).json(doctor);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const deleteDoctorProfile = async (req, res) => {
	try {
		const doctor = await Doctor.findById(req.params.id);

		if (!doctor) {
			return res.status(404).json({ message: 'Doctor profile not found' });
		}

		const isOwner = doctor.user.toString() === req.user._id.toString();
		const isAdmin = req.user.role === 'admin';

		if (!isOwner && !isAdmin) {
			return res.status(403).json({ message: 'Access denied' });
		}

		await doctor.deleteOne();
		res.json({ message: 'Doctor profile deleted' });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

module.exports = {
	getAllDoctors,
	getDoctorById,
	getMyDoctorProfile,
	upsertDoctorProfile,
	deleteDoctorProfile,
};
