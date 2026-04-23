import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
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
  FiUsers
} from 'react-icons/fi';

const DashboardLayout = ({ children }) => {
	const { user, logout } = useAuth();
	const location = useLocation();
  const navigate = useNavigate();
	
	const currentPath = location.pathname;

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
    { path: '/dashboard', label: 'Doctor Dashboard', icon: <FiHome /> },
    { path: '/doctor/appointments', label: 'Appointments', icon: <FiCalendar /> },
    { path: '/doctor/profile', label: 'My Profile', icon: <FiUsers /> },
    { path: '/settings', label: 'Settings', icon: <FiSettings /> },
  ];

  const getNavItems = () => {
    switch (user?.role) {
      case 'admin': return adminNav;
      case 'doctor': return doctorNav;
      case 'patient':
      default: return patientNav;
    }
  };

  const navItems = getNavItems();

	return (
		<div className={styles.layout}>
			<aside className={styles.sidebar}>
				<Link to="/dashboard" className={styles.brand}>
					<div className={styles.brandIcon}>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
							<path d="M19 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.11 21 21 20.1 21 19V5C21 3.9 20.11 3 19 3ZM17 13H13V17H11V13H7V11H11V7H13V11H17V13Z" />
						</svg>
					</div>
					<div>
						MediSync<br/>
						<span style={{ fontSize: "0.6rem", letterSpacing: "1px", color: "var(--text-secondary)", textTransform: "uppercase" }}>Clinical Portal</span>
					</div>
				</Link>

				<nav className={styles.nav}>
          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              className={`${styles.navItem} ${currentPath === item.path ? styles.navItemActive : ""}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
				</nav>

				{user?.role === 'patient' && (
					<button 
						onClick={() => navigate('/book-appointment')} 
						className={styles.newAppointmentBtn} 
						style={{ width: 'calc(100% - 32px)', margin: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
					>
						<FiCalendar />
						New Appointment
					</button>
				)}

        <div className="mt-auto p-4 border-t border-gray-100">
          <button 
            onClick={logout}
            className="flex items-center gap-3 text-gray-500 hover:text-red-500 transition-colors w-full p-2 rounded-lg hover:bg-red-50"
          >
            <FiLogOut />
            <span>Sign Out</span>
          </button>
        </div>
			</aside>

			<main className={styles.main}>
				<div className={styles.topBar}>
					<div className={styles.searchBar}>
						<FiSearch />
						<input type="text" placeholder="Search appointments, doctors..." />
					</div>
					
					<div className={styles.headerRight}>
						<button className={styles.iconBtn}>
							<FiBell />
							<div className={styles.notificationBadge}></div>
						</button>
						<button className={styles.iconBtn}>
							<FiHelpCircle />
						</button>
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-gray-800">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role || 'Patient'}</p>
              </div>
              <img 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=21674E&color=fff`} 
                alt="Profile" 
                className={styles.profileAvatar} 
              />
            </div>
					</div>
				</div>

				<div className="p-6 overflow-y-auto h-[calc(100vh-70px)]">
				  {children}
				</div>
			</main>
		</div>
	);
};

export default DashboardLayout;
