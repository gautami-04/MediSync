import DashboardLayout from "../components/DashboardLayout";
import styles from "./Payments.module.css";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getMyPayments } from "../services/payment.service";

const formatCurrency = (value) => {
	return `$${Number(value || 0).toFixed(2)}`;
};

const formatDate = (value) => {
	if (!value) return "-";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return String(value);
	return date.toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "2-digit",
	});
};

const formatMethod = (value) => {
	if (!value) return "-";
	return String(value)
		.replace(/_/g, " ")
		.replace(/\b\w/g, (c) => c.toUpperCase());
};

const STATUS_CLASS = {
	paid: styles.statusPaid,
	pending: styles.statusPending,
	failed: styles.statusFailed,
};

const Payments = () => {
	const [payments, setPayments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const loadPayments = async () => {
		setLoading(true);
		setError("");
		try {
			const data = await getMyPayments();
			setPayments(Array.isArray(data) ? data : []);
		} catch (requestError) {
			setError(
				requestError?.response?.data?.message ||
					requestError?.message ||
					"Failed to fetch payments."
			);
			setPayments([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadPayments();
	}, []);

	const summary = useMemo(() => {
		const totalSpent = payments
			.filter((item) => item?.status === "paid")
			.reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);

		const pendingTotal = payments
			.filter((item) => item?.status === "pending")
			.reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);

		return {
			totalSpent,
			pendingTotal,
			pendingCount: payments.filter((item) => item?.status === "pending").length,
		};
	}, [payments]);

	return (
		<DashboardLayout activePath="/payments">
			<div className={styles.header}>
				<div>
					<h1 className={styles.headerTitle}>Payment History</h1>
					<p className={styles.headerSubtitle}>Manage your clinical billing and transaction records.</p>
				</div>
				<button className={styles.btnPrimary} onClick={loadPayments}>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
					Refresh Data
				</button>
			</div>

			{error ? <div style={{ color: "#b9383d", fontWeight: 600 }}>{error}</div> : null}

			<div className={styles.summaryGrid}>
				<div className={styles.summaryCard}>
					<div className={styles.summaryLabel}>TOTAL SPENT</div>
					<div className={styles.summaryValue}>{formatCurrency(summary.totalSpent)}</div>
					<div className={styles.summarySub}>
						<span className={styles.trendUp}>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
							12%
						</span>
						vs last quarter
					</div>
					<div className={styles.iconWrapper}>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
					</div>
				</div>

				<div className={styles.summaryCard}>
					<div className={styles.summaryLabel}>PENDING PAYMENTS</div>
					<div className={styles.summaryValue}>{formatCurrency(summary.pendingTotal)}</div>
					<div className={styles.summarySub}>
						{summary.pendingCount} active invoices require attention
					</div>
					<div className={styles.iconWrapper} style={{ background: "var(--input-bg)", color: "var(--brand-primary)" }}>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><circle cx="12" cy="13" r="2"></circle><path d="M12 15v2"></path></svg>
					</div>
				</div>

				<div className={styles.summaryCardGreen}>
					<h3 style={{ margin: "0 0 12px", fontSize: "1.5rem" }}>Automate your health with CarePay.</h3>
					<p style={{ margin: "0 0 16px", opacity: 0.9, lineHeight: 1.5, fontSize: "0.95rem" }}>
						Save 5% on all routine check-ups when you enable auto-pay.
					</p>
					<Link to="#" style={{ color: "white", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
						Setup CarePay &rarr;
					</Link>
				</div>
			</div>

			<div className={styles.tableSection}>
				<div className={styles.tableHeader}>
					<h2 className={styles.tableTitle}>Recent Transactions</h2>
					<div className={styles.tableActions}>
						<button className={styles.btnOutline}>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
							Filter
						</button>
						<button className={styles.btnOutline}>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
							Export PDF
						</button>
					</div>
				</div>

				<table className={styles.table}>
					<thead>
						<tr>
							<th>DATE</th>
							<th>DOCTOR & SPECIALTY</th>
							<th>AMOUNT</th>
							<th>PAYMENT METHOD</th>
							<th>STATUS</th>
							<th>ACTION</th>
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr>
								<td colSpan="6" style={{ textAlign: "center", padding: "24px" }}>Loading payments...</td>
							</tr>
						) : null}
						{!loading && payments.length === 0 ? (
							<tr>
								<td colSpan="6" style={{ textAlign: "center", padding: "24px", color: "var(--text-secondary)" }}>
									No transactions found yet.
								</td>
							</tr>
						) : null}
						{payments.map((payment) => (
							<tr key={payment._id}>
								<td>
									<div className={styles.dateCell}>{formatDate(payment.paidAt || payment.createdAt)}</div>
									<div className={styles.idText}>ID: {payment.referenceId || payment._id}</div>
								</td>
								<td>
									<div className={styles.doctorCell}>
										<div className={styles.doctorIcon}>
											<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
										</div>
										<div>
											<div className={styles.doctorName}>{payment.doctorName || "General Consultation"}</div>
											<div className={styles.doctorSpec}>{payment.specialty || "Healthcare Service"}</div>
										</div>
									</div>
								</td>
								<td><div className={styles.amount}>{formatCurrency(payment.amount)}</div></td>
								<td>
									<div className={styles.methodCell}>
										<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
										{formatMethod(payment.method)}
									</div>
								</td>
								<td>
									<span className={`${styles.statusPill} ${STATUS_CLASS[payment.status] || styles.statusPending}`}>
										{String(payment.status || "pending").toUpperCase()}
									</span>
								</td>
								<td>
									<Link to="#" className={styles.actionLink}>
										View Details
									</Link>
								</td>
							</tr>
						))}
					</tbody>
				</table>

				<div className={styles.tableFooter}>
					<div style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
						Showing {payments.length} transaction{payments.length === 1 ? "" : "s"}
					</div>
					<div className={styles.pagination}></div>
				</div>
			</div>
		</DashboardLayout>
	);
};

export default Payments;
