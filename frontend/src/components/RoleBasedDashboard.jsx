import React from 'react';
import useAuth from '../hooks/useAuth';
import PatientDashboard from '../pages/patient/Dashboard';
import AdminDashboard from '../pages/admin/Dashboard';
// Import DoctorDashboard when Gautami is ready, using a stub for now
const DoctorDashboardStub = () => <div className="p-10"><h1>Doctor Dashboard</h1><p>Gautami is working on this!</p></div>;

const RoleBasedDashboard = () => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'doctor':
      return <DoctorDashboardStub />;
    case 'patient':
    default:
      return <PatientDashboard />;
  }
};

export default RoleBasedDashboard;
