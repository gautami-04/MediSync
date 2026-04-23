import React, { useEffect, useState } from 'react';
import { getDoctorAppointments, rescheduleAppointment } from '../../services/appointment.service';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleReschedule = async (id) => {
    const date = window.prompt('Enter new date (YYYY-MM-DD)');
    if (!date) return;
    const time = window.prompt('Enter new time (e.g. 09:30 AM)');
    if (!time) return;

    try {
      await rescheduleAppointment(id, { date, time });
      await load();
      alert('Rescheduled');
    } catch (err) {
      console.error(err);
      alert('Unable to reschedule');
    }
  };

  if (loading) return <div>Loading appointments...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2>Appointments</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {appointments.map((a) => (
          <div key={a._id} style={{ padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
            <div><strong>Patient:</strong> {a.patient?.name || 'Unknown'}</div>
            <div><strong>Date:</strong> {a.date} <strong>Time:</strong> {a.time}</div>
            <div><strong>Status:</strong> {a.status}</div>
            <div style={{ marginTop: 8 }}>
              <button onClick={() => handleReschedule(a._id)}>Reschedule</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorAppointments;
