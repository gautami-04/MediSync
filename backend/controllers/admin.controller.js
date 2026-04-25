const User = require('../models/user.model');
const Doctor = require('../models/doctor.model');
const Appointment = require('../models/appointment.model');
const Payment = require('../models/payment.model');

// Get all users
exports.getAllUsers = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;

		const [users, total] = await Promise.all([
			User.find().select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
			User.countDocuments()
		]);

		res.json({ total, page, limit, data: users });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Get all doctors with approval status
exports.getAllDoctors = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;

		const [doctors, total] = await Promise.all([
			Doctor.find().populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
			Doctor.countDocuments()
		]);

		res.json({ total, page, limit, data: doctors });
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
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;

		const [appointments, total] = await Promise.all([
			Appointment.find()
				.populate('patient', 'name email')
				.populate('doctor', 'name email')
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit),
			Appointment.countDocuments()
		]);

		res.json({ total, page, limit, data: appointments });
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
