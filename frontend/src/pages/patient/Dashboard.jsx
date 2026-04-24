import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import DashboardLayout from "../../components/DashboardLayout";
import { getMyAppointments } from "../../services/appointment.service";
import { getMyMedicalRecords } from "../../services/medicalRecord.service";
import { getMyPayments } from "../../services/payment.service";
import styles from "./Dashboard.module.css";

const MONTH_LABELS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN"];

const parseAppointmentDate = (appointment) => {
	if (!appointment?.date) return null;
	const dateTime = appointment.time
		? new Date(`${appointment.date} ${appointment.time}`)
		: new Date(appointment.date);
	return Number.isNaN(dateTime.getTime()) ? null : dateTime;
};

const formatDate = (value) => {
	if (!value) return "-";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return String(value);
	return date.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
};

const formatTime = (appointment) => {
	if (appointment?.time) return appointment.time;
	const parsed = parseAppointmentDate(appointment);
	if (!parsed) return "-";
	return parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const PatientDashboard = () => {
	const { user } = useAuth();
	const [appointments, setAppointments] = useState([]);
	const [payments, setPayments] = useState([]);
	const [records, setRecords] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		let isMounted = true;
		const loadDashboard = async () => {
			setLoading(true);
			setError("");
			const [appointmentsRes, paymentsRes, recordsRes] = await Promise.allSettled([
				getMyAppointments(),
				getMyPayments(),
				getMyMedicalRecords(),
			]);
			if (!isMounted) return;

			if (appointmentsRes.status === "fulfilled") {
				setAppointments(Array.isArray(appointmentsRes.value) ? appointmentsRes.value : []);
			} else { setAppointments([]); }

			if (paymentsRes.status === "fulfilled") {
				setPayments(Array.isArray(paymentsRes.value) ? paymentsRes.value : []);
			} else { setPayments([]); }

			if (recordsRes.status === "fulfilled") {
				const payload = recordsRes.value;
				const normalized = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
				setRecords(normalized);
			} else { setRecords([]); }

			if (appointmentsRes.status === "rejected" && paymentsRes.status === "rejected") {
				setError("Unable to load dashboard data right now.");
			}
			setLoading(false);
		};
		loadDashboard();
		return () => { isMounted = false; };
	}, []);

	const userName = useMemo(() => {
		const name = user?.fullName || user?.name || "User";
		return name.split(" ")[0];
	}, [user]);

	const upcomingAppointments = useMemo(() => {
		const now = new Date();
		return appointments
			.filter((a) => a?.status !== "cancelled")
			.filter((a) => { const d = parseAppointmentDate(a); return d ? d >= now : true; })
			.sort((a, b) => {
				const dA = parseAppointmentDate(a);
				const dB = parseAppointmentDate(b);
				if (!dA && !dB) return 0;
				if (!dA) return 1;
				if (!dB) return -1;
				return dA - dB;
			});
	}, [appointments]);

	const stats = useMemo(() => {
		const paidTotal = payments
			.filter((p) => p?.status === "paid")
			.reduce((sum, p) => sum + (Number(p?.amount) || 0), 0);
		const uniqueDoctors = new Set(
			appointments
				.map((a) => a?.doctor?.user?.name || a?.doctor?.name || a?.doctorName)
				.filter(Boolean)
		).size;
		return {
			appointmentsCount: appointments.length,
			upcomingCount: upcomingAppointments.length,
			totalSpent: paidTotal,
			savedDoctors: uniqueDoctors,
		};
	}, [appointments, payments, upcomingAppointments]);

	const monthlyVisits = useMemo(() => {
		const now = new Date();
		const monthBuckets = new Map();
		for (let i = 5; i >= 0; i -= 1) {
			const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
			const key = `${d.getFullYear()}-${d.getMonth()}`;
			monthBuckets.set(key, 0);
		}
		appointments.forEach((a) => {
			const date = parseAppointmentDate(a);
			if (!date) return;
			const key = `${date.getFullYear()}-${date.getMonth()}`;
			if (monthBuckets.has(key)) monthBuckets.set(key, (monthBuckets.get(key) || 0) + 1);
		});
		const values = Array.from(monthBuckets.values());
		const maxValue = Math.max(...values, 1);
		return values.map((count, index) => ({
			label: MONTH_LABELS[index],
			count,
			height: Math.max(20, Math.round((count / maxValue) * 90)),
		}));
	}, [appointments]);

	const getDoctorName = (appointment) => {
		if (appointment?.doctor?.user?.name) return appointment.doctor.user.name;
		if (appointment?.doctor?.name) return appointment.doctor.name;
		return "Assigned Doctor";
	};

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
					<div className={styles.statValue}>{stats.appointmentsCount}</div>
					<div className={styles.statLabel}>APPOINTMENTS</div>
				</div>
				<div className={styles.statCard}>
					<div className={styles.statIcon} style={{ background: "var(--brand-primary)", color: "white" }}>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
					</div>
					<div className={styles.statValue}>{stats.upcomingCount}</div>
					<div className={styles.statLabel}>UPCOMING</div>
				</div>
				<div className={`${styles.statCard} ${styles.statCardGold}`}>
					<div className={styles.statIcon}>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
					</div>
					<div className={styles.statValue}>${stats.totalSpent.toFixed(2)}</div>
					<div className={styles.statLabel}>TOTAL SPENT</div>
				</div>
				<div className={styles.statCard}>
					<div className={styles.statIcon}>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
					</div>
					<div className={styles.statValue}>{stats.savedDoctors}</div>
					<div className={styles.statLabel}>DOCTORS VISITED</div>
				</div>
			</div>

			{error ? <div style={{ marginTop: "12px", color: "#b9383d", fontWeight: 600 }}>{error}</div> : null}

			<div className={styles.dashboardContent}>
				<div className={styles.chartCard}>
					<div style={{ display: "flex", justifyContent: "space-between", marginBottom: "40px" }}>
						<div>
							<h3 style={{ margin: "0 0 4px", fontSize: "1.2rem" }}>Monthly Visits</h3>
							<p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.9rem" }}>Health activity over the last 6 months</p>
						</div>
					</div>
					{loading ? <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Loading visit trends...</div> : null}
					<div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: "10%", padding: "0 5%" }}>
						{monthlyVisits.map((item, i) => (
							<div key={item.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", flex: 1 }}>
								<div style={{ width: "40px", background: i % 2 === 0 ? "rgba(33, 103, 78, 0.1)" : "var(--brand-primary)", height: `${item.height}%`, borderRadius: "8px 8px 0 0", transition: "height 0.6s ease" }}></div>
								<div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)" }}>{item.label}</div>
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
						{upcomingAppointments.slice(0, 3).map((appointment) => (
							<div className={styles.upcomingItem} key={appointment._id}>
								<div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--input-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-primary)" }}>
									<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
								</div>
								<div style={{ flex: 1 }}>
									<div style={{ fontWeight: 700, color: "var(--bg-dark)" }}>{getDoctorName(appointment)}</div>
									<div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Status: {appointment?.status || "booked"}</div>
								</div>
								<div style={{ textAlign: "right" }}>
									<div style={{ fontWeight: 700, color: "var(--brand-primary)" }}>{formatDate(appointment?.date)}</div>
									<div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{formatTime(appointment)}</div>
								</div>
							</div>
						))}
						{!loading && upcomingAppointments.length === 0 ? (
							<div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>No upcoming appointments yet.</div>
						) : null}
					</div>

					<div className={styles.healthTip}>
						<div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--brand-primary)", letterSpacing: "1px", marginBottom: "8px", textTransform: "uppercase" }}>Health Tip</div>
						<div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
							Regular check-ups help detect health issues early. Book your next appointment today!
						</div>
					</div>
				</div>
			</div>

			<div style={{ marginTop: "40px" }}>
				<h3 style={{ margin: 0, fontSize: "1.2rem" }}>Recent Records</h3>
				<div className={styles.recordsGrid}>
					{records.slice(0, 3).map((record) => (
						<div className={styles.recordCard} key={record._id}>
							<div className={styles.recordIcon}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
							<div>
								<div style={{ fontWeight: 700, color: "var(--bg-dark)" }}>{record?.title || "Medical Record"}</div>
								<div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{record?.diagnosis || "No diagnosis added"} • {formatDate(record?.createdAt)}</div>
							</div>
						</div>
					))}
					{!loading && records.length === 0 ? (
						<div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>No medical records available yet.</div>
					) : null}
				</div>
			</div>
		</DashboardLayout>
	);
};

export default PatientDashboard;
