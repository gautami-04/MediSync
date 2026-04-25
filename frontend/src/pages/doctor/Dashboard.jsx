import React, { useState, useEffect } from 'react';
import { getMyDoctorStats } from '../../services/doctor.service';
import useAuth from '../../hooks/useAuth';
import DashboardLayout from '../../components/DashboardLayout';
import styles from './Dashboard.module.css';

const StatCard = ({ title, value, badgeText, badgeClass, icon }) => (
  <div className={styles.statCard}>
    <div className={styles.statHeader}>
      <div className={styles.statIconWrap}>
        {icon}
      </div>
      <div className={`${styles.statBadge} ${styles[badgeClass]}`}>
        {badgeText}
      </div>
    </div>
    <div className={styles.statTitle}>{title}</div>
    <div className={styles.statValue}>{value}</div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ todaysAppointments: 0, totalPatients: 0, totalEarnings: 0, pendingApprovals: 0 });
  const [loading, setLoading] = useState(true);

  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, apptData] = await Promise.all([
          getMyDoctorStats(),
          import('../../services/appointment.service').then(m => m.getDoctorAppointments())
        ]);
        setStats(statsData);
        setAppointments(apptData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <DashboardLayout activePath="/doctor/dashboard"><div>Loading dashboard...</div></DashboardLayout>;

  return (
    <DashboardLayout activePath="/doctor/dashboard">
      <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>Clinical Overview</h1>
        <div className={styles.headerSubtitle}>
          Welcome back, {user?.name || 'Dr. Smith'}. You have {stats.todaysAppointments || 0} appointments today.
        </div>
      </div>

      <div className={styles.statsGrid}>
        <StatCard 
          title="Today's Appointments" 
          value={stats.todaysAppointments || '0'} 
          badgeText="+4 NEW" 
          badgeClass="badgeNew"
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>}
        />
        <StatCard 
          title="Total Patients" 
          value={stats.totalPatients || '0'} 
          badgeText="TOTAL" 
          badgeClass="badgeTotal"
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>}
        />
        <StatCard 
          title="Total Earnings" 
          value={`$${stats.totalEarnings || '0'}`} 
          badgeText="MONTHLY" 
          badgeClass="badgeMonthly"
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>}
        />
        <StatCard 
          title="Pending Approvals" 
          value={stats.pendingApprovals || '0'} 
          badgeText="ACTION REQUIRED" 
          badgeClass="badgeAction"
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>}
        />
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div className={styles.chartTitle}>Today's Schedule</div>
            <a href="/appointments" className={styles.chartLink}>View All</a>
          </div>
          <div className={styles.scheduleList}>
            {appointments.slice(0, 5).map((item, idx) => (
              <div key={idx} className={styles.scheduleItem}>
                <div className={styles.scheduleTimeline}></div>
                <div className={`${styles.scheduleDot} ${item.status === 'booked' ? styles.dotArrived : styles.dotPending}`}></div>
                <div className={styles.scheduleTime}>{item.time}</div>
                <div className={styles.scheduleContent}>
                  <div className={styles.schedulePatient}>{item.patient?.name || 'Unknown Patient'}</div>
                  <div className={styles.scheduleDesc}>Date: {item.date}</div>
                </div>
                <div className={`${styles.scheduleStatus} ${item.status === 'booked' ? styles.statusConfirmed : styles.statusPending}`}>
                  {item.status || 'BOOKED'}
                </div>
              </div>
            ))}
            {appointments.length === 0 && <div style={{ color: 'var(--text-secondary)' }}>No appointments scheduled.</div>}
          </div>
        </div>

      </div>

      <div className={styles.recentPatientsCard}>
        <div className={styles.chartHeader}>
          <div className={styles.chartTitle}>Recent Patients</div>
        </div>
        
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Last Visit</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(new Set(appointments.filter(a => a.patient).map(a => a.patient._id)))
              .map(id => appointments.find(a => a.patient && a.patient._id === id))
              .slice(0, 5)
              .map((a, i) => (
              <tr key={i}>
                <td>
                  <div className={styles.patientCell}>
                    <img src={`https://ui-avatars.com/api/?name=${(a.patient?.name || 'P').replace(' ', '+')}&background=random`} alt={a.patient?.name} className={styles.patientAvatar} />
                    <div>
                      <div className={styles.patientName}>{a.patient?.name}</div>
                      <div className={styles.patientId}>{a.patient?.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{color: '#9ab4a8'}}>{a.date}</td>
                <td>
                  <div className={styles.statusIndicator}>
                    <div className={`${styles.statusDot} ${styles.dotStable}`}></div>
                    Active
                  </div>
                </td>
                <td>
                  <button className={styles.actionBtn}>View</button>
                </td>
              </tr>
            ))}
            {appointments.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No recent patients found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
    </DashboardLayout>
  );
};

export default Dashboard;
