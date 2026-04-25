import React, { useState, useEffect } from 'react';
import { 
  FiUsers, 
  FiActivity, 
  FiDollarSign, 
  FiCheckCircle
} from 'react-icons/fi';
import api from '../../services/api';
import DashboardLayout from "../../components/DashboardLayout";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, doctorsRes] = await Promise.all([
          api.get('/api/admin/payment-stats'),
          api.get('/api/admin/doctors')
        ]);
        setStats(statsRes.data);
        setDoctors(doctorsRes.data?.data || doctorsRes.data || []);
      } catch (err) {
        console.error('Failed to fetch admin data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const approveDoctor = async (id) => {
    try {
      await api.put(`/api/admin/doctors/${id}/approve`);
      setDoctors(doctors.map(doc => doc._id === id ? { ...doc, isApproved: true } : doc));
    } catch (err) {
      alert('Failed to approve doctor');
    }
  };

  if (loading) return <DashboardLayout><div className="p-10 text-center">Loading Admin Portal...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Control Center</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-green-50 rounded-lg text-green-600"><FiDollarSign size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-800">₹{stats?.totalRevenue || 0}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-blue-50 rounded-lg text-blue-600"><FiUsers size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Doctors</p>
              <h3 className="text-2xl font-bold text-gray-800">{doctors.length}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-purple-50 rounded-lg text-purple-600"><FiActivity size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">System Health</p>
              <h3 className="text-2xl font-bold text-gray-800">Optimal</h3>
            </div>
          </div>
        </div>

        {/* Doctor Approval Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">Doctor Verification Requests</h2>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
              <tr>
                <th className="px-6 py-3 font-semibold">Doctor</th>
                <th className="px-6 py-3 font-semibold">Specialization</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {doctors.map(doc => (
                <tr key={doc._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-800">{doc.user?.name}</div>
                    <div className="text-xs text-gray-500">{doc.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{doc.specialization}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${doc.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {doc.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {!doc.isApproved && (
                      <button 
                        onClick={() => approveDoctor(doc._id)}
                        className="flex items-center gap-1 bg-primary-600 text-white px-3 py-1 rounded text-sm hover:bg-primary-700"
                      >
                        <FiCheckCircle /> Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
