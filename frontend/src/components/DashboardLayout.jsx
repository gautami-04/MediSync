import { Link, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import styles from "./DashboardLayout.module.css";

const DashboardLayout = ({ children, activePath = "/home" }) => {
	const { user, logout } = useAuth();
	const location = useLocation();
	
	const currentPath = location.pathname;
	const active = activePath || currentPath;

	return (
		<div className={styles.layout}>
			<aside className={styles.sidebar}>
				<Link to="/home" className={styles.brand}>
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
					<Link to="/home" className={`${styles.navItem} ${active === "/home" ? styles.navItemActive : ""}`}>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
						Dashboard
					</Link>
					<Link to="/appointments" className={`${styles.navItem} ${active === "/appointments" ? styles.navItemActive : ""}`}>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
						Appointments
					</Link>
					<Link to="/payments" className={`${styles.navItem} ${active === "/payments" ? styles.navItemActive : ""}`}>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
						Payments
					</Link>
					<Link to="/settings" className={`${styles.navItem} ${active === "/settings" ? styles.navItemActive : ""}`}>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
						Settings
					</Link>
				</nav>

				<button className={styles.newAppointmentBtn}>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
					New Appointment
				</button>
			</aside>

			<main className={styles.main}>
				<div className={styles.topBar}>
					<div className={styles.searchBar}>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
						<input type="text" placeholder="Search transactions, patients..." />
					</div>
					
					<div className={styles.headerRight}>
						<button className={styles.iconBtn}>
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
							<div className={styles.notificationBadge}></div>
						</button>
						<button className={styles.iconBtn}>
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
						</button>
						<img src="https://ui-avatars.com/api/?name=Sarah+Jenkins&background=random" alt="Profile" className={styles.profileAvatar} onClick={logout} title="Logout" />
					</div>
				</div>

				{children}
			</main>
		</div>
	);
};

export default DashboardLayout;
