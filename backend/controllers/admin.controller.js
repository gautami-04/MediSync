const User = require('../models/user.model');
const Doctor = require('../models/doctor.model');
const Appointment = require('../models/appointment.model');
const Payment = require('../models/payment.model');

// Get all users
exports.getAllUsers = async (req, res) => {
	try {
		const users = await User.find().select('-password').sort({ createdAt: -1 });
		res.json(users);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Get all doctors with approval status
exports.getAllDoctors = async (req, res) => {
	try {
		const doctors = await Doctor.find()
			.populate('user', 'name email')
			.sort({ createdAt: -1 });
		res.json(doctors);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Approve doctor
exports.approveDoctor = async (req, res) => {
	try {
		const doctor = await Doctor.findById(req.params.id);
		if (!doctor) {
			return res.status(404).json({ message: 'Doctor not found' });
		}

		doctor.isApproved = true;
		doctor.approvedAt = Date.now();
		await doctor.save();

		res.json({ message: 'Doctor approved successfully', doctor });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Reject doctor (unapprove or delete)
exports.rejectDoctor = async (req, res) => {
	try {
		const doctor = await Doctor.findById(req.params.id);
		if (!doctor) {
			return res.status(404).json({ message: 'Doctor not found' });
		}

		doctor.isApproved = false;
		doctor.approvedAt = null;
		await doctor.save();

		res.json({ message: 'Doctor approval revoked', doctor });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Get all appointments
exports.getAllAppointments = async (req, res) => {
	try {
		const appointments = await Appointment.find()
			.populate('patient', 'name email')
			.populate('doctor', 'name email')
			.sort({ createdAt: -1 });
		res.json(appointments);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Get payment stats
exports.getPaymentStats = async (req, res) => {
	try {
		const totalRevenue = await Payment.aggregate([
			{ $match: { status: 'paid' } },
			{ $group: { _id: null, total: { $sum: '$amount' } } },
		]);

		const statusCounts = await Payment.aggregate([
			{ $group: { _id: '$status', count: { $sum: 1 } } },
		]);

		res.json({
			totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
			statusCounts,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
