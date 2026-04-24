const User = require('../models/user.model');
const Appointment = require('../models/appointment.model');
const Doctor = require('../models/doctor.model');

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
      recentUsers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAdminDashboardStats };
