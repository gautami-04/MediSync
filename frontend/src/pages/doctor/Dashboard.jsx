import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import DashboardLayout from "../../components/DashboardLayout";
import { getDoctorAppointments } from "../../services/appointment.service";
import styles from "./Dashboard.module.css";

const STATUS_CLASS = {
	booked: styles.statusBooked,
	confirmed: styles.statusConfirmed,
	completed: styles.statusCompleted,
	cancelled: styles.statusCancelled,
};

const DoctorDashboard = () => {
	const { user } = useAuth();
	const [appointments, setAppointments] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let mounted = true;
		const load = async () => {
			setLoading(true);
			try {
				const data = await getDoctorAppointments();
				if (mounted) setAppointments(Array.isArray(data) ? data : []);
			} catch {
				if (mounted) setAppointments([]);
			} finally {
				if (mounted) setLoading(false);
			}
		};
		load();
		return () => { mounted = false; };
	}, []);

	const doctorName = useMemo(() => {
		const name = user?.fullName || user?.name || "Doctor";
		return name.split(" ")[0];
	}, [user]);

	const todayStr = new Date().toISOString().split("T")[0];

	const stats = useMemo(() => {
		const todayAppts = appointments.filter((a) => a.date === todayStr);
		const uniquePatients = new Set(appointments.map((a) => a?.patient?._id || a?.patient).filter(Boolean)).size;
		const completed = appointments.filter((a) => a.status === "completed").length;
		const pending = appointments.filter((a) => a.status === "booked" || a.status === "confirmed").length;
		return { todayCount: todayAppts.length, totalPatients: uniquePatients, completed, pending };
	}, [appointments, todayStr]);

	const todaySchedule = useMemo(() => {
		return appointments
			.filter((a) => a.date === todayStr && a.status !== "cancelled")
			.sort((a, b) => (a.time || "").localeCompare(b.time || ""))
			.slice(0, 6);
	}, [appointments, todayStr]);

	const recentAppointments = useMemo(() => {
		return [...appointments]
			.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
			.slice(0, 5);
	}, [appointments]);

	return (
		<DashboardLayout activePath="/home">
			<div className={styles.header}>
				<div>
					<h1 className={styles.headerTitle}>Good day, Dr. {doctorName}</h1>
					<p className={styles.headerSubtitle}>Here's your practice overview for today.</p>
				</div>
			</div>

			<div className={styles.statsGrid}>
				<div className={`${styles.statCard} ${styles.statCardAccent}`}>
					<div className={styles.statIcon}>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
					</div>
					<div className={styles.statValue}>{stats.todayCount}</div>
					<div className={styles.statLabel}>TODAY'S APPOINTMENTS</div>
				</div>
				<div className={styles.statCard}>
					<div className={styles.statIcon}>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
					</div>
					<div className={styles.statValue}>{stats.totalPatients}</div>
					<div className={styles.statLabel}>TOTAL PATIENTS</div>
				</div>
				<div className={styles.statCard}>
					<div className={styles.statIcon} style={{ background: "#e8f5e9", color: "#2e7d32" }}>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
					</div>
					<div className={styles.statValue}>{stats.completed}</div>
					<div className={styles.statLabel}>COMPLETED</div>
				</div>
				<div className={styles.statCard}>
					<div className={styles.statIcon} style={{ background: "#fff3e0", color: "#e65100" }}>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
					</div>
					<div className={styles.statValue}>{stats.pending}</div>
					<div className={styles.statLabel}>PENDING</div>
				</div>
			</div>

			<div className={styles.contentGrid}>
				<div className={styles.card}>
					<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
						<h3 className={styles.cardTitle} style={{ margin: 0 }}>Today's Schedule</h3>
						<Link to="/appointments" style={{ color: "var(--brand-primary)", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" }}>View All →</Link>
					</div>
					{loading ? (
						<div className={styles.emptyMsg}>Loading schedule...</div>
					) : todaySchedule.length === 0 ? (
						<div className={styles.emptyMsg}>No appointments scheduled for today.</div>
					) : (
						todaySchedule.map((appt) => (
							<div className={styles.scheduleItem} key={appt._id}>
								<div className={styles.scheduleTime}>{appt.time || "-"}</div>
								<div className={`${styles.scheduleDot} ${appt.status === "booked" ? styles.scheduleDotPending : ""}`}></div>
								<div className={styles.scheduleInfo}>
									<div className={styles.scheduleName}>{appt?.patient?.name || "Patient"}</div>
									<div className={styles.scheduleType}>{appt.reason || "General Consultation"}</div>
								</div>
								<span className={`${styles.statusPill} ${STATUS_CLASS[appt.status] || styles.statusBooked}`}>
									{appt.status}
								</span>
							</div>
						))
					)}
				</div>

				<div>
					<div className={styles.card}>
						<h3 className={styles.cardTitle}>Quick Actions</h3>
						<div className={styles.quickActions}>
							<Link to="/appointments" style={{ textDecoration: "none" }}>
								<button className={styles.quickAction}>
									<div className={styles.quickActionIcon}>
										<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
									</div>
									Manage Appointments
								</button>
							</Link>
							<Link to="/settings" style={{ textDecoration: "none" }}>
								<button className={styles.quickAction}>
									<div className={styles.quickActionIcon}>
										<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
									</div>
									Update Profile
								</button>
							</Link>
						</div>
					</div>

					<div className={styles.card} style={{ marginTop: "24px" }}>
						<h3 className={styles.cardTitle}>Recent Patients</h3>
						{recentAppointments.length === 0 ? (
							<div className={styles.emptyMsg}>No patient visits yet.</div>
						) : (
							recentAppointments.map((appt) => (
								<div className={styles.scheduleItem} key={appt._id}>
									<div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--input-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-primary)", flexShrink: 0 }}>
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
									</div>
									<div className={styles.scheduleInfo}>
										<div className={styles.scheduleName}>{appt?.patient?.name || "Patient"}</div>
										<div className={styles.scheduleType}>{appt.date} at {appt.time}</div>
									</div>
								</div>
							))
						)}
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
};

export default DoctorDashboard;
