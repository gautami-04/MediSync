import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatientDashboard } from '../../services/patient.service';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  FiCalendar, 
  FiFileText, 
  FiCreditCard, 
  FiHeart, 
  FiClock, 
  FiPlusCircle 
} from 'react-icons/fi';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const dashboardData = await getPatientDashboard();
        setData(dashboardData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return (
    <DashboardLayout activePath="/home">
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    </DashboardLayout>
  );

  if (error) return (
    <DashboardLayout activePath="/home">
      <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg">{error}</div>
    </DashboardLayout>
  );

  const stats = [
    { title: 'Total Appointments', value: data?.appointmentStats?.total || 0, icon: <FiCalendar className="text-blue-500" />, color: 'bg-blue-50' },
    { title: 'Upcoming', value: data?.appointmentStats?.upcoming || 0, icon: <FiClock className="text-green-500" />, color: 'bg-green-50' },
    { title: 'Medical Records', value: data?.recordsCount || 0, icon: <FiFileText className="text-purple-500" />, color: 'bg-purple-50' },
    { title: 'Total Spent', value: `₹${data?.totalSpent || 0}`, icon: <FiCreditCard className="text-orange-500" />, color: 'bg-orange-50' },
  ];

  return (
    <DashboardLayout activePath="/home">
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Patient Dashboard</h1>
            <p className="text-gray-500">Welcome back! Here is what's happening with your health today.</p>
          </div>
          <button 
            onClick={() => navigate('/book-appointment')}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-md"
          >
            <FiPlusCircle />
            <span>Book Appointment</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                <h3 className="text-xl font-bold text-gray-800">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Appointments */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Recent Appointments</h2>
              <button onClick={() => navigate('/appointments')} className="text-primary-600 text-sm font-medium hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              {data?.recentAppointments?.length > 0 ? (
                data.recentAppointments.map((app) => (
                  <div key={app._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                        {app.doctor?.name?.charAt(0) || 'D'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{app.doctor?.name || 'Doctor'}</p>
                        <p className="text-xs text-gray-500">{app.date} at {app.time}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      app.status === 'booked' ? 'bg-blue-100 text-blue-700' :
                      app.status === 'completed' ? 'bg-green-100 text-green-700' :
                      app.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No appointments found.</p>
              )}
            </div>
          </div>

          {/* Recent Payments */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Recent Payments</h2>
              <button onClick={() => navigate('/payments')} className="text-primary-600 text-sm font-medium hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              {data?.recentPayments?.length > 0 ? (
                data.recentPayments.map((pay) => (
                  <div key={pay._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-gray-100">
                        <FiCreditCard className="text-gray-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Consultation Fee</p>
                        <p className="text-xs text-gray-500">{new Date(pay.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className="font-bold text-gray-800">₹{pay.amount}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No payments found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions / Saved Doctors Count */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 rounded-xl shadow-lg text-white flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-xl font-bold">Manage Your Saved Doctors</h3>
            <p className="text-primary-100">Quickly access your favorite healthcare providers.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FiHeart className="fill-current" />
              <span className="font-bold text-lg">{data?.savedDoctorsCount || 0} Saved</span>
            </div>
            <button 
              onClick={() => navigate('/favorites')}
              className="bg-white text-primary-700 px-6 py-2 rounded-lg font-bold hover:bg-primary-50 transition-colors shadow-sm"
            >
              View Favorites
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
