import { useMemo } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import DashboardLayout from "../components/DashboardLayout";
import styles from "./Home.module.css";

const Home = () => {
	const { user, logout } = useAuth();

	const userName = useMemo(() => {
		const name = user?.fullName || user?.name || "Sarah";
		return name.split(" ")[0];
	}, [user]);

	return (
		<DashboardLayout activePath="/home">
			<div className={styles.header}>
				<div>
					<h1 className={styles.headerTitle}>Welcome back, {userName}</h1>
					<p className={styles.headerSubtitle}>Your health overview is up to date.</p>
				</div>
			</div>

			<div className={styles.statsGrid}>
					<div className={styles.statCard}>
						<div className={styles.statBadge}>THIS MONTH</div>
						<div className={styles.statIcon}>
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
						</div>
						<div className={styles.statValue}>12</div>
						<div className={styles.statLabel}>APPOINTMENTS</div>
					</div>
					<div className={styles.statCard}>
						<div className={styles.statIcon} style={{ background: "var(--brand-primary)", color: "white" }}>
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
						</div>
						<div className={styles.statValue}>02</div>
						<div className={styles.statLabel}>UPCOMING</div>
					</div>
					<div className={`${styles.statCard} ${styles.statCardGold}`}>
						<div className={styles.statIcon}>
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
						</div>
						<div className={styles.statValue}>$1,420</div>
						<div className={styles.statLabel}>TOTAL SPENT</div>
					</div>
					<div className={styles.statCard}>
						<div className={styles.statIcon}>
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
						</div>
						<div className={styles.statValue}>08</div>
						<div className={styles.statLabel}>SAVED DOCTORS</div>
					</div>
				</div>

				<div className={styles.dashboardContent}>
					<div className={styles.chartCard}>
						<div style={{ display: "flex", justifyContent: "space-between", marginBottom: "40px" }}>
							<div>
								<h3 style={{ margin: "0 0 4px", fontSize: "1.2rem" }}>Monthly Visits</h3>
								<p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.9rem" }}>Health activity over the last 6 months</p>
							</div>
							<div style={{ display: "flex", gap: "8px", background: "rgba(0,0,0,0.05)", borderRadius: "99px", padding: "4px" }}>
								<div style={{ padding: "4px 16px", borderRadius: "99px", fontSize: "0.85rem", fontWeight: 700 }}>2023</div>
								<div style={{ padding: "4px 16px", borderRadius: "99px", fontSize: "0.85rem", fontWeight: 700, background: "var(--bg-dark)", color: "white" }}>2024</div>
							</div>
						</div>
						
						{/* Placeholder for chart */}
						<div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: "10%", padding: "0 5%" }}>
							{["JAN", "FEB", "MAR", "APR", "MAY", "JUN"].map((month, i) => (
								<div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", flex: 1 }}>
									<div style={{ width: "40px", background: i % 2 === 0 ? "rgba(33, 103, 78, 0.1)" : "var(--brand-primary)", height: `${40 + Math.random() * 60}%`, borderRadius: "8px 8px 0 0" }}></div>
									<div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)" }}>{month}</div>
								</div>
							))}
						</div>
					</div>

					<div className={styles.upcomingCard}>
						<div className={styles.upcomingHeader}>
							<h3 style={{ margin: 0, fontSize: "1.2rem" }}>Upcoming<br/>Appointments</h3>
							<Link to="/appointments" style={{ color: "var(--brand-primary)", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" }}>View All</Link>
						</div>

						<div className={styles.upcomingList}>
							<div className={styles.upcomingItem}>
								<img src="/images/doctor_portrait.png" alt="Doctor" />
								<div style={{ flex: 1 }}>
									<div style={{ fontWeight: 700, color: "var(--bg-dark)" }}>Dr. Marcus Thorne</div>
									<div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Cardiology • 45m</div>
								</div>
								<div style={{ textAlign: "right" }}>
									<div style={{ fontWeight: 700, color: "var(--brand-primary)" }}>Oct 12</div>
									<div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>10:30 AM</div>
								</div>
							</div>
							<div className={styles.upcomingItem}>
								<img src="https://ui-avatars.com/api/?name=Elena+Rodriguez&background=random" alt="Doctor" />
								<div style={{ flex: 1 }}>
									<div style={{ fontWeight: 700, color: "var(--bg-dark)" }}>Dr. Elena Rodriguez</div>
									<div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Dermatology • 30m</div>
								</div>
								<div style={{ textAlign: "right" }}>
									<div style={{ fontWeight: 700, color: "var(--brand-primary)" }}>Oct 15</div>
									<div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>02:15 PM</div>
								</div>
							</div>
							<div className={styles.upcomingItem}>
								<img src="https://ui-avatars.com/api/?name=Simon+Chen&background=random" alt="Doctor" />
								<div style={{ flex: 1 }}>
									<div style={{ fontWeight: 700, color: "var(--bg-dark)" }}>Dr. Simon Chen</div>
									<div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>General Health • 60m</div>
								</div>
								<div style={{ textAlign: "right" }}>
									<div style={{ fontWeight: 700, color: "var(--brand-primary)" }}>Oct 22</div>
									<div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>09:00 AM</div>
								</div>
							</div>
						</div>

						<div className={styles.healthTip}>
							<div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--brand-primary)", letterSpacing: "1px", marginBottom: "8px", textTransform: "uppercase" }}>Health Tip</div>
							<div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
								Don't forget to complete your pre-checkup form for your cardiology appointment.
							</div>
							<svg style={{ position: "absolute", right: "-20px", bottom: "-20px", opacity: 0.1, color: "var(--brand-primary)" }} width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg>
						</div>
					</div>
				</div>

				<div style={{ marginTop: "40px" }}>
					<h3 style={{ margin: 0, fontSize: "1.2rem" }}>Recent Records</h3>
					<div className={styles.recordsGrid}>
						<div className={styles.recordCard}>
							<div className={styles.recordIcon}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg></div>
							<div>
								<div style={{ fontWeight: 700, color: "var(--bg-dark)" }}>Blood Test Results</div>
								<div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Uploaded 2 days ago • PDF (1.2MB)</div>
							</div>
						</div>
						<div className={styles.recordCard}>
							<div className={styles.recordIcon}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg></div>
							<div>
								<div style={{ fontWeight: 700, color: "var(--bg-dark)" }}>Vaccination Card</div>
								<div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Updated Sept 28, 2024</div>
							</div>
						</div>
						<div className={styles.recordCard}>
							<div className={styles.recordIcon}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></div>
							<div>
								<div style={{ fontWeight: 700, color: "var(--bg-dark)" }}>Chest X-Ray</div>
								<div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Aug 14, 2024 • Clinical Image</div>
							</div>
						</div>
					</div>
				</div>
		</DashboardLayout>
	);
};

export default Home;
