import React, { useEffect, useState } from 'react';
import { getDoctorAppointments, rescheduleAppointment } from '../../services/appointment.service';
import DashboardLayout from '../../components/DashboardLayout';
import styles from './DoctorAppointments.module.css';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rescheduleModal, setRescheduleModal] = useState({ isOpen: false, appointmentId: null, date: '', time: '' });

  const load = async () => {
    try {
      const data = await getDoctorAppointments();
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openReschedule = (a) => {
    setRescheduleModal({ isOpen: true, appointmentId: a._id, date: a.date, time: a.time });
  };

  const handleRescheduleSubmit = async () => {
    try {
      await rescheduleAppointment(rescheduleModal.appointmentId, { 
        date: rescheduleModal.date, 
        time: rescheduleModal.time 
      });
      await load();
      setRescheduleModal({ isOpen: false, appointmentId: null, date: '', time: '' });
    } catch (err) {
      console.error(err);
      alert('Unable to reschedule');
    }
  };

  if (loading) return <DashboardLayout activePath="/doctor/appointments"><div>Loading appointments...</div></DashboardLayout>;

  return (
    <DashboardLayout activePath="/doctor/appointments">
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerSubtitle}>SCHEDULE MANAGEMENT</div>
        <div className={styles.headerRow}>
          <h1 className={styles.headerTitle}>Availability Grid</h1>
          <div className={styles.weekNav}>
            <button className={`${styles.navBtn} ${styles.navBtnPrev}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
              Previous Week
            </button>
            <button className={`${styles.navBtn} ${styles.navBtnNext}`}>
              Next Week
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </div>
      </div>

      <div className={styles.mainGrid} style={{ display: 'block' }}>
        <div className={styles.calendarCard}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>All Appointments</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {appointments.map((a) => (
                <div key={a._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', border: '1px solid #dcf1e7', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <img src={`https://ui-avatars.com/api/?name=${(a.patient?.name || 'P').replace(' ', '+')}&background=random`} alt={a.patient?.name} style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{a.patient?.name || 'Unknown Patient'}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Date: {a.date} | Time: {a.time}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '6px 12px', borderRadius: '99px', background: a.status === 'booked' ? '#dcf1e7' : '#f1f5f9', color: a.status === 'booked' ? '#1b6348' : '#64748b', textTransform: 'uppercase' }}>
                      {a.status}
                    </span>
                    <button onClick={() => openReschedule(a)} style={{ background: 'white', color: 'var(--brand-primary)', border: '1px solid var(--brand-primary)', padding: '10px 20px', borderRadius: '99px', fontWeight: 600, cursor: 'pointer' }}>
                      Reschedule
                    </button>
                  </div>
                </div>
              ))}
              {appointments.length === 0 && <div style={{ color: 'var(--text-secondary)', padding: '24px 0' }}>No appointments found.</div>}
            </div>
          </div>
        </div>
      </div>

      {rescheduleModal.isOpen && (
        <div className={styles.rescheduleModal}>
          <div className={styles.modalContent}>
            <div className={styles.modalTitle}>Reschedule Appointment</div>
            <label className={styles.settingLabel}>NEW DATE</label>
            <input 
              type="date" 
              className={styles.modalInput} 
              value={rescheduleModal.date} 
              onChange={e => setRescheduleModal({...rescheduleModal, date: e.target.value})} 
            />
            <label className={styles.settingLabel}>NEW TIME</label>
            <input 
              type="time" 
              className={styles.modalInput} 
              value={rescheduleModal.time} 
              onChange={e => setRescheduleModal({...rescheduleModal, time: e.target.value})} 
            />
            <div className={styles.modalActions}>
              <button className={`${styles.modalBtn} ${styles.modalBtnCancel}`} onClick={() => setRescheduleModal({isOpen: false, appointmentId: null, date: '', time: ''})}>Cancel</button>
              <button className={`${styles.modalBtn} ${styles.modalBtnConfirm}`} onClick={handleRescheduleSubmit}>Confirm Reschedule</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </DashboardLayout>
  );
};

export default DoctorAppointments;
