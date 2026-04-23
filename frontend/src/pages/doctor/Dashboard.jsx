import React, { useEffect, useState } from 'react';
import { getMyDoctorStats } from '../../services/doctor.service';

const StatCard = ({ label, value }) => (
  <div style={{ padding: 16, background: '#f6fff9', borderRadius: 8, minWidth: 160, margin: 8 }}>
    <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
    <div style={{ fontSize: 12, color: '#666' }}>{label}</div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({ todaysAppointments: 0, totalPatients: 0, totalEarnings: 0, pendingApprovals: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyDoctorStats();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2>Doctor Dashboard</h2>
      <div style={{ display: 'flex', gap: 16 }}>
        <StatCard label="Today's Appointments" value={stats.todaysAppointments} />
        <StatCard label="Total Patients" value={stats.totalPatients} />
        <StatCard label="Total Earnings" value={`$${stats.totalEarnings}`} />
        <StatCard label="Pending Approvals" value={stats.pendingApprovals} />
      </div>
    </div>
  );
};

export default Dashboard;
