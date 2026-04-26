import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useToast } from "./ToastContext";
import { getDoctorAppointments, getMyAppointments } from "../services/appointment.service";
import styles from "./DashboardLayout.module.css";
import { 
  FiHome, 
  FiCalendar, 
  FiFileText, 
  FiCreditCard, 
  FiHeart, 
  FiSearch, 
  FiSettings, 
  FiLogOut,
  FiBell,
  FiHelpCircle,
  FiUsers,
  FiStar,
  FiClock,
  FiUser
} from 'react-icons/fi';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { addToast } = useToast();
  
  const currentPath = location.pathname;
  const role = user?.role || "patient";

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        let data = [];
        if (role === 'doctor') {
          const res = await getDoctorAppointments();
          data = res.appointments || res.data || res || [];
        } else {
          const res = await getMyAppointments();
          data = res.appointments || res.data || res || [];
        }
        
        const latest = Array.isArray(data) ? data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5) : [];
        setNotifications(latest);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [role]);

  const patientNav = [
    { path: '/dashboard', label: 'Dashboard', icon: <FiHome /> },
    { path: '/find-doctors', label: 'Find Doctors', icon: <FiSearch /> },
    { path: '/appointment-history', label: 'Appointments', icon: <FiCalendar /> },
    { path: '/medical-records', label: 'Medical Records', icon: <FiFileText /> },
    { path: '/favorites', label: 'Favorites', icon: <FiHeart /> },
    { path: '/payments', label: 'Payments', icon: <FiCreditCard /> },
    { path: '/settings', label: 'Settings', icon: <FiSettings /> },
  ];

  const adminNav = [
    { path: '/dashboard', label: 'Admin Dashboard', icon: <FiHome /> },
    { path: '/admin/users', label: 'Manage Users', icon: <FiUsers /> },
    { path: '/admin/doctors', label: 'Verify Doctors', icon: <FiFileText /> },
    { path: '/payments', label: 'Transactions', icon: <FiCreditCard /> },
    { path: '/settings', label: 'System Settings', icon: <FiSettings /> },
  ];

  const doctorNav = [
    { path: '/dashboard', label: 'Dashboard', icon: <FiHome /> },
    { path: '/doctor/appointments', label: 'Appointments', icon: <FiCalendar /> },
    { path: '/doctor/patients', label: 'My Patients', icon: <FiUsers /> },
    { path: '/doctor/availability', label: 'Availability', icon: <FiClock /> },
    { path: '/doctor/reviews', label: 'Patient Reviews', icon: <FiStar /> },
    { path: '/payments', label: 'Financials', icon: <FiCreditCard /> },
    { path: '/doctor/my-profile', label: 'My Profile', icon: <FiUser /> },
  ];

  const getNavItems = () => {
    switch (role) {
      case 'admin': return adminNav;
      case 'doctor': return doctorNav;
      case 'patient':
      default: return patientNav;
    }
  };

  const navItems = getNavItems();
  const displayName = user?.fullName || user?.name || "User";

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    setShowSupport(false);
  };

  const handleSupportClick = () => {
    setShowSupport(!showSupport);
    setShowNotifications(false);
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <Link to="/dashboard" className={styles.brand}>
          <div className={styles.brandIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M19 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.11 21 21 20.1 21 19V5C21 3.9 20.11 3 19 3ZM17 13H13V17H11V13H7V11H11V7H13V11H17V13Z" />
            </svg>
          </div>
          <div>
            <div className={styles.brandName}>MediSync</div>
            <div className={styles.brandTag}>
              {role === "admin" ? "Admin Portal" : role === "doctor" ? "Doctor Portal" : "Patient Portal"}
            </div>
          </div>
        </Link>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              className={`${styles.navItem} ${currentPath.startsWith(item.path) ? styles.navItemActive : ""}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.logoutSection}>
          <button onClick={logout} className={styles.logoutBtn}>
            <FiLogOut />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.topBar}>
          <div className={styles.searchContainer}>
            <FiSearch style={{color: 'var(--text-muted)'}} />
            <input 
              type="text" 
              placeholder={role === "admin" ? "Search records..." : "Search..."} 
              readOnly
              style={{ cursor: 'default' }}
            />
          </div>
          
          <div className={styles.topBarActions}>
            <div className={styles.dropdownContainer}>
              <button className={styles.actionIconBtn} title="Notifications" onClick={handleNotificationClick}>
                <FiBell />
                <div className={styles.notificationBadge}></div>
              </button>
              {showNotifications && (
                <div className={styles.dropdownBox}>
                  <div className={styles.dropdownTitle}>Clinical Alerts</div>
                  <div className={styles.dropdownContent} style={{ maxHeight: '300px', overflowY: 'auto', padding: '0' }}>
                    {notifications.length > 0 ? notifications.map(n => (
                      <div 
                        key={n._id} 
                        className={styles.notificationItem}
                        onClick={() => {
                          const target = user?.role === 'doctor' ? '/doctor/appointments' : '/appointment-history';
                          navigate(target);
                          setShowNotifications(false);
                          addToast(`Opening appointment status`, 'info');
                        }}
                      >
                        <div className={styles.notifTitle}>
                          {user?.role === 'doctor' 
                            ? (n.patient?.user?.name || 'Patient') 
                            : (n.doctor?.user?.name || 'Doctor')}
                        </div>
                        <div className={styles.notifDesc}>{n.date} at {n.time}</div>
                        <div className={styles.notifStatus}>{n.status.toUpperCase()}</div>
                      </div>
                    )) : (
                      <div style={{ padding: '20px', textAlign: 'center' }}>No recent appointments.</div>
                    )}
                    <button 
                      onClick={() => { 
                        const notifPath = user?.role === 'doctor' ? '/doctor/notifications' : '/appointment-history';
                        navigate(notifPath); 
                        setShowNotifications(false); 
                      }} 
                      style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', fontWeight: 700, padding: '12px', cursor: 'pointer', fontSize: '0.8rem', width: '100%', textAlign: 'center', borderTop: '1px solid var(--border-color)' }}
                    >
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.dropdownContainer}>
              <button className={styles.actionIconBtn} title="Support" onClick={handleSupportClick}>
                <FiHelpCircle />
              </button>
              {showSupport && (
                <div className={styles.dropdownBox}>
                  <div className={styles.dropdownTitle}>Help & Support</div>
                  <div className={styles.dropdownContent}>
                    Contact for more.....
                  </div>
                </div>
              )}
            </div>
            
            <div className={styles.userProfile} onClick={() => navigate('/settings')}>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{displayName}</span>
                <span className={styles.userRole} style={{ marginLeft: '4px', opacity: 0.8 }}>• {role}</span>
              </div>
              <div className={styles.userAvatar}>
                {user?.profilePicture ? (
                  <img src={`http://localhost:5000${user.profilePicture}`} alt="Avatar" />
                ) : (
                  <img src={`https://ui-avatars.com/api/?name=${(user?.name || "User").replace(' ', '+')}&background=random`} alt="Avatar" />
                )}
              </div>
            </div>
          </div>
        </header>

        <div className={styles.contentWrapper}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
