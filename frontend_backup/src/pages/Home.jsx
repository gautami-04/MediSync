import { useMemo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import DashboardLayout from "../components/DashboardLayout";
import styles from "./Home.module.css";
import { getPatientDashboard } from "../services/patient.service";

const Home = () => {
	const { user, logout, isAuthenticated } = useAuth();

	const [dashboard, setDashboard] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const userName = useMemo(() => {
		const name = user?.fullName || user?.name || "Sarah";
		return name.split(" ")[0];
	}, [user]);

	const formatCurrency = (value) => {
		if (value === undefined || value === null) return '—';
		try {
			return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(value);
		} catch (e) {
			return `$${value}`;
		}
	};

	useEffect(() => {
		let mounted = true;

		const load = async () => {
			if (!isAuthenticated) return;
			setLoading(true);
			setError(null);
			try {
				const data = await getPatientDashboard();
				if (!mounted) return;
				setDashboard(data || null);
			} catch (err) {
				if (!mounted) return;
				setError(err?.response?.data?.message || err?.message || 'Unable to load dashboard');
			} finally {
				if (mounted) setLoading(false);
			}
		};

		load();

		return () => {
			mounted = false;
		};
	}, [isAuthenticated]);

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
						<div className={styles.statValue}>{dashboard?.summary?.totalAppointments ?? "—"}</div>
						<div className={styles.statLabel}>APPOINTMENTS</div>
					</div>
					<div className={styles.statCard}>
						<div className={styles.statIcon} style={{ background: "var(--brand-primary)", color: "white" }}>
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
						</div>
						<div className={styles.statValue}>{dashboard?.summary?.upcomingAppointments ?? "—"}</div>
						<div className={styles.statLabel}>UPCOMING</div>
					</div>
					<div className={`${styles.statCard} ${styles.statCardGold}`}>
						<div className={styles.statIcon}>
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
						</div>
						<div className={styles.statValue}>{formatCurrency(dashboard?.summary?.totalSpent)}</div>
						<div className={styles.statLabel}>TOTAL SPENT</div>
					</div>
					<div className={styles.statCard}>
						<div className={styles.statIcon}>
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
						</div>
						<div className={styles.statValue}>{dashboard?.summary?.savedDoctorsCount ?? '—'}</div>
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
							{loading ? (
								<div>Loading...</div>
							) : dashboard?.recentAppointments?.length ? (
								dashboard.recentAppointments.map((a) => {
									const doctorName = a?.doctor?.user?.name || a?.doctor?.name || 'Doctor';
									const when = new Date(a?.date || a?.scheduledAt || a?.createdAt || Date.now());
									const dateLabel = when.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
									const timeLabel = when.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
									return (
										<div key={a._id} className={styles.upcomingItem}>
											<img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(doctorName)}&background=random`} alt="Doctor" />
											<div style={{ flex: 1 }}>
												<div style={{ fontWeight: 700, color: "var(--bg-dark)" }}>{doctorName}</div>
												<div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{a.specialization || a?.doctor?.specialization || ''}</div>
											</div>
											<div style={{ textAlign: "right" }}>
												<div style={{ fontWeight: 700, color: "var(--brand-primary)" }}>{dateLabel}</div>
												<div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{timeLabel}</div>
											</div>
										</div>
									);
								})
							) : (
								<div>No upcoming appointments</div>
							)}
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

					{dashboard?.recentPayments?.length ? (
						<div style={{ marginTop: 24 }}>
							<h3 style={{ margin: 0, fontSize: '1.2rem' }}>Recent Payments</h3>
							<div className={styles.recordsGrid}>
								{dashboard.recentPayments.map((p) => (
									<div key={p._id} className={styles.recordCard}>
										<div className={styles.recordIcon}>
											<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5"></path></svg>
										</div>
										<div>
											<div style={{ fontWeight: 700, color: 'var(--bg-dark)' }}>{formatCurrency(p.amount)}</div>
											<div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.method || p.status} • {new Date(p.createdAt).toLocaleDateString()}</div>
										</div>
										</div>
								))}
							</div>
						</div>
					) : null}
			
		</DashboardLayout>
	);
};

export default Home;
