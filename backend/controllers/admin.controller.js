const User = require('../models/user.model');
const Doctor = require('../models/doctor.model');
const Patient = require('../models/patient.model');
const Appointment = require('../models/appointment.model');
const Payment = require('../models/payment.model');


const getAdminDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalDoctors, totalPatients, totalAppointments, appointments] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'doctor' }),
        User.countDocuments({ role: 'patient' }),
        Appointment.countDocuments(),
        Appointment.find().lean(),
      ]);

    const completedAppointments = appointments.filter((a) => a.status === 'completed').length;
    const pendingAppointments = appointments.filter(
      (a) => a.status === 'booked' || a.status === 'confirmed'
    ).length;
    const cancelledAppointments = appointments.filter((a) => a.status === 'cancelled').length;

    const recentUsers = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const totalRevenueResult = await Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

    res.json({
      stats: {
        totalUsers,
        totalDoctors,
        totalPatients,
        totalAppointments,
        completedAppointments,
        pendingAppointments,
        cancelledAppointments,
      },
      totalRevenue,
      recentUsers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users (paginated)
const getAllUsers = async (req, res) => {
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

// Get all doctors with approval status (paginated)
const getAllDoctors = async (req, res) => {
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
const approveDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    doctor.isApproved = true;
    doctor.approvedAt = Date.now();
    await doctor.save();
    res.json({ message: 'Doctor approved successfully', doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject doctor (unapprove)
const rejectDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    doctor.isApproved = false;
    doctor.approvedAt = null;
    await doctor.save();
    res.json({ message: 'Doctor approval revoked', doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all appointments (paginated)
const getAllAppointments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const [appointments, total] = await Promise.all([
      Appointment.find()
        .populate({ path: 'patient', populate: { path: 'user', select: 'name email' } })
        .populate({ path: 'doctor', populate: { path: 'user', select: 'name email' } })
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
const getPaymentStats = async (req, res) => {
  try {
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const statusCounts = await Payment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    res.json({
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      statusCounts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete admin users' });
    
    // Also delete associated profiles
    if (user.role === 'doctor') await Doctor.findOneAndDelete({ user: user._id });
    if (user.role === 'patient') await Patient.findOneAndDelete({ user: user._id });
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User and associated profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAdminDashboardStats,
  getAllUsers,
  getAllDoctors,
  approveDoctor,
  rejectDoctor,
  getAllAppointments,
  getPaymentStats,
  deleteUser
};
