import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getPatientDashboard } from '../../services/patient.service';
import Button from '../../components/Button';
import { 
  FiCalendar, 
  FiFileText, 
  FiCreditCard, 
  FiHeart, 
  FiClock, 
  FiPlusCircle,
  FiActivity
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
      } catch (err) {
        setError('Failed to load clinical dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div>Analyzing medical records...</div>;

  const stats = [
    { title: 'Total Visits', value: data?.appointmentStats?.total || 0, icon: <FiCalendar />, bg: 'var(--primary-light)', color: 'var(--primary)' },
    { title: 'Upcoming', value: data?.appointmentStats?.upcoming || 0, icon: <FiClock />, bg: '#e0f2fe', color: '#0369a1' },
    { title: 'Medical Records', value: data?.recordsCount || 0, icon: <FiFileText />, bg: '#f3e8ff', color: '#7e22ce' },
    { title: 'Health Spending', value: `₹${data?.totalSpent || 0}`, icon: <FiCreditCard />, bg: '#ffedd5', color: '#c2410c' },
  ];

  return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Medical Dashboard</h1>
            <p style={{ color: 'var(--text-muted)' }}>Overview of your recent clinical activities and health records.</p>
          </div>
          <Button onClick={() => navigate('/find-doctors')} style={{ width: 'auto', padding: '0 24px' }}>
            <FiPlusCircle style={{ marginRight: '8px' }} /> New Appointment
          </Button>
        </header>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          {stats.map((stat, idx) => (
            <div key={idx} style={{ background: 'white', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', background: stat.bg, color: stat.color, borderRadius: 'var(--radius-sm)' }}>{stat.icon}</div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{stat.title}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{stat.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          {/* Recent Appointments */}
          <div style={{ background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 800 }}>Recent Appointments</h2>
              <Link to="/appointments" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>View History</Link>
            </div>
            <div style={{ padding: '12px' }}>
              {data?.recentAppointments?.length > 0 ? (
                data.recentAppointments.map((app) => (
                  <div key={app._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid #f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                        {app.doctor?.user?.name?.charAt(0) || 'D'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{app.doctor?.user?.name || 'Practitioner'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{app.date} • {app.time}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '4px 10px', borderRadius: 'var(--radius-full)', background: '#f1f5f9' }}>{app.status.toUpperCase()}</span>
                  </div>
                ))
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No recent appointments.</div>
              )}
            </div>
          </div>

          {/* Recent Records */}
          <div style={{ background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 800 }}>Medical Records</h2>
              <Link to="/medical-records" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>Manage Records</Link>
            </div>
            <div style={{ padding: '12px' }}>
              {data?.recentRecords?.length > 0 ? (
                data.recentRecords.map((record) => (
                  <div key={record._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid #f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <FiFileText color="var(--text-muted)" />
                      <div>
                        <div style={{ fontWeight: 700 }}>{record.title || 'Clinical Record'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dr. {record.doctor?.user?.name}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{new Date(record.createdAt).toLocaleDateString()}</div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No medical records available.</div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default PatientDashboard;
