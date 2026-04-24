import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import DashboardLayout from "../../components/DashboardLayout";
import { getAdminDashboardStats } from "../../services/admin.service";
import styles from "./Dashboard.module.css";

const ROLE_AVATAR = { patient: styles.avatarPatient, doctor: styles.avatarDoctor, admin: styles.avatarAdmin };
const ROLE_PILL = { patient: styles.rolePatient, doctor: styles.roleDoctor, admin: styles.roleAdmin };

const AdminDashboard = () => {
	const { user } = useAuth();
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		let mounted = true;
		const load = async () => {
			setLoading(true);
			setError("");
			try {
				const res = await getAdminDashboardStats();
				if (mounted) setData(res);
			} catch (err) {
				if (mounted) setError(err?.response?.data?.message || "Failed to load dashboard data.");
			} finally {
				if (mounted) setLoading(false);
			}
		};
		load();
		return () => { mounted = false; };
	}, []);

	const adminName = useMemo(() => {
		const name = user?.fullName || user?.name || "Admin";
		return name.split(" ")[0];
	}, [user]);

	const stats = data?.stats || {};
	const recentUsers = data?.recentUsers || [];

	return (
		<DashboardLayout activePath="/home">
			<div className={styles.header}>
				<div>
					<h1 className={styles.headerTitle}>Welcome, {adminName}</h1>
					<p className={styles.headerSubtitle}>Platform administration overview</p>
				</div>
				<span className={styles.roleBadge}>Admin Portal</span>
			</div>

			{error ? <div style={{ color: "#c62828", fontWeight: 600, marginBottom: "16px" }}>{error}</div> : null}

			<div className={styles.statsGrid}>
				<div className={`${styles.statCard} ${styles.statCardPurple}`}>
					<div className={styles.statIcon}>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
					</div>
					<div className={styles.statValue}>{loading ? "—" : stats.totalUsers || 0}</div>
					<div className={styles.statLabel}>TOTAL USERS</div>
				</div>
				<div className={styles.statCard}>
					<div className={styles.statIcon} style={{ background: "#e8f5e9", color: "#2e7d32" }}>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
					</div>
					<div className={styles.statValue}>{loading ? "—" : stats.totalDoctors || 0}</div>
					<div className={styles.statLabel}>DOCTORS</div>
				</div>
				<div className={styles.statCard}>
					<div className={styles.statIcon} style={{ background: "#e3f2fd", color: "#1565c0" }}>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
					</div>
					<div className={styles.statValue}>{loading ? "—" : stats.totalPatients || 0}</div>
					<div className={styles.statLabel}>PATIENTS</div>
				</div>
				<div className={styles.statCard}>
					<div className={styles.statIcon}>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
					</div>
					<div className={styles.statValue}>{loading ? "—" : stats.totalAppointments || 0}</div>
					<div className={styles.statLabel}>APPOINTMENTS</div>
				</div>
			</div>

			<div className={styles.contentGrid}>
				<div className={styles.card}>
					<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
						<h3 className={styles.cardTitle} style={{ margin: 0 }}>Recent Users</h3>
					</div>
					{loading ? (
						<div className={styles.emptyMsg}>Loading users...</div>
					) : recentUsers.length === 0 ? (
						<div className={styles.emptyMsg}>No users registered yet.</div>
					) : (
						recentUsers.map((u) => (
							<div className={styles.userRow} key={u._id}>
								<div className={`${styles.userAvatar} ${ROLE_AVATAR[u.role] || styles.avatarPatient}`}>
									{(u.name || "U").charAt(0).toUpperCase()}
								</div>
								<div className={styles.userInfo}>
									<div className={styles.userName}>{u.name}</div>
									<div className={styles.userEmail}>{u.email}</div>
								</div>
								<span className={`${styles.userRolePill} ${ROLE_PILL[u.role] || styles.rolePatient}`}>
									{u.role}
								</span>
							</div>
						))
					)}
				</div>

				<div>
					<div className={styles.card}>
						<h3 className={styles.cardTitle}>Appointment Breakdown</h3>
						<div className={styles.breakdownGrid}>
							<div className={styles.breakdownItem}>
								<div className={styles.breakdownValue}>{stats.pendingAppointments || 0}</div>
								<div className={styles.breakdownLabel}>Pending</div>
							</div>
							<div className={styles.breakdownItem}>
								<div className={styles.breakdownValue}>{stats.completedAppointments || 0}</div>
								<div className={styles.breakdownLabel}>Completed</div>
							</div>
							<div className={styles.breakdownItem}>
								<div className={styles.breakdownValue}>{stats.cancelledAppointments || 0}</div>
								<div className={styles.breakdownLabel}>Cancelled</div>
							</div>
							<div className={styles.breakdownItem}>
								<div className={styles.breakdownValue}>{stats.totalAppointments || 0}</div>
								<div className={styles.breakdownLabel}>Total</div>
							</div>
						</div>
					</div>

					<div className={styles.card} style={{ marginTop: "24px" }}>
						<h3 className={styles.cardTitle}>Quick Actions</h3>
						<div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
							<Link to="/appointments" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px", borderRadius: "14px", background: "var(--input-bg)", fontWeight: 600, color: "var(--text-primary)", transition: "all 0.2s ease" }}>
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-primary)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
								Manage All Appointments
							</Link>
							<Link to="/settings" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px", borderRadius: "14px", background: "var(--input-bg)", fontWeight: 600, color: "var(--text-primary)", transition: "all 0.2s ease" }}>
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-primary)" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33"></path></svg>
								System Settings
							</Link>
						</div>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
};

export default AdminDashboard;
