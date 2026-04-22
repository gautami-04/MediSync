import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import useAuth from '../hooks/useAuth';
import { getMyAppointments, cancelAppointment } from '../services/appointment.service';
import styles from './Home.module.css';

const Appointments = () => {
  const { isAuthenticated } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMyAppointments();
        if (!mounted) return;
        setAppointments(data || []);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Failed to load appointments');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  const handleCancel = async (id) => {
    try {
      await cancelAppointment(id);
      setAppointments((prev) => prev.map(a => (a._id === id ? { ...a, status: 'cancelled' } : a)));
    } catch (err) {
      // ignore for now
    }
  };

  return (
    <DashboardLayout activePath="/appointments">
      <div style={{ padding: '16px' }}>
        <h2 style={{ marginTop: 0 }}>My Appointments</h2>

        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : appointments.length === 0 ? (
          <div>No appointments found.</div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {appointments.map((a) => (
              <div key={a._id} className={styles.upcomingItem} style={{ display: 'flex', alignItems: 'center' }}>
                <img src={a.doctor?.avatar || '/images/doctor_portrait.png'} alt="Doctor" style={{ width: 48, height: 48, borderRadius: 8, marginRight: 12 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{a.doctor?.name || 'Doctor'}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{a.date} • {a.time}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: a.status === 'cancelled' ? '#999' : 'var(--brand-primary)' }}>{a.status}</div>
                  {a.status !== 'cancelled' ? (
                    <button onClick={() => handleCancel(a._id)} style={{ marginTop: 8, background: 'transparent', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer' }}>Cancel</button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Appointments;
