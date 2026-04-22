import DashboardLayout from "../components/DashboardLayout";
import styles from "./Payments.module.css";
import { Link } from "react-router-dom";

const Payments = () => {
	return (
		<DashboardLayout activePath="/payments">
			<div className={styles.header}>
				<div>
					<h1 className={styles.headerTitle}>Payment History</h1>
					<p className={styles.headerSubtitle}>Manage your clinical billing and transaction records.</p>
				</div>
				<button className={styles.btnPrimary}>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
					Make a Payment
				</button>
			</div>

			<div className={styles.summaryGrid}>
				<div className={styles.summaryCard}>
					<div className={styles.summaryLabel}>TOTAL SPENT</div>
					<div className={styles.summaryValue}>$1,420</div>
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
					<div className={styles.summaryValue}>$115</div>
					<div className={styles.summarySub}>
						2 active invoices require attention
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
						<tr>
							<td>
								<div className={styles.dateCell}>Oct 24, 2023</div>
								<div className={styles.idText}>ID: MC-29384</div>
							</td>
							<td>
								<div className={styles.doctorCell}>
									<div className={styles.doctorIcon}>
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
									</div>
									<div>
										<div className={styles.doctorName}>Dr. Sarah Jenkins</div>
										<div className={styles.doctorSpec}>Cardiology<br/>Consultation</div>
									</div>
								</div>
							</td>
							<td><div className={styles.amount}>$450.00</div></td>
							<td>
								<div className={styles.methodCell}>
									<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
									Visa ****4242
								</div>
							</td>
							<td><span className={`${styles.statusPill} ${styles.statusPaid}`}>PAID</span></td>
							<td>
								<Link to="#" className={styles.actionLink}>
									View Receipt
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
								</Link>
							</td>
						</tr>
						<tr>
							<td>
								<div className={styles.dateCell}>Oct 18, 2023</div>
								<div className={styles.idText}>ID: MC-20512</div>
							</td>
							<td>
								<div className={styles.doctorCell}>
									<div className={styles.doctorIcon}>
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
									</div>
									<div>
										<div className={styles.doctorName}>Dr. Marcus Thorne</div>
										<div className={styles.doctorSpec}>Psychotherapy Session</div>
									</div>
								</div>
							</td>
							<td><div className={styles.amount}>$115.00</div></td>
							<td>
								<div className={styles.methodCell}>
									<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18"></path><path d="M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4"></path><line x1="5" y1="21" x2="5" y2="10"></line><line x1="19" y1="21" x2="19" y2="10"></line><path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"></path></svg>
									Bank Transfer
								</div>
							</td>
							<td><span className={`${styles.statusPill} ${styles.statusPending}`}>PENDING</span></td>
							<td>
								<Link to="#" className={styles.actionLink}>
									Invoice Details
								</Link>
							</td>
						</tr>
						<tr>
							<td>
								<div className={styles.dateCell}>Oct 12, 2023</div>
								<div className={styles.idText}>ID: MC-24111</div>
							</td>
							<td>
								<div className={styles.doctorCell}>
									<div className={styles.doctorIcon}>
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
									</div>
									<div>
										<div className={styles.doctorName}>Pathology Lab</div>
										<div className={styles.doctorSpec}>Bloodwork Panels</div>
									</div>
								</div>
							</td>
							<td><div className={styles.amount}>$210.00</div></td>
							<td>
								<div className={styles.methodCell}>
									<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
									Visa ****4242
								</div>
							</td>
							<td><span className={`${styles.statusPill} ${styles.statusPaid}`}>PAID</span></td>
							<td>
								<Link to="#" className={styles.actionLink}>
									View Receipt
								</Link>
							</td>
						</tr>
						<tr>
							<td>
								<div className={styles.dateCell}>Oct 05, 2023</div>
								<div className={styles.idText}>ID: MC-27089</div>
							</td>
							<td>
								<div className={styles.doctorCell}>
									<div className={styles.doctorIcon}>
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
									</div>
									<div>
										<div className={styles.doctorName}>Dr. Emily Zhang</div>
										<div className={styles.doctorSpec}>Dental Cleaning</div>
									</div>
								</div>
							</td>
							<td><div className={styles.amount}>$85.00</div></td>
							<td>
								<div className={styles.methodCell}>
									<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
									Amex ****1002
								</div>
							</td>
							<td><span className={`${styles.statusPill} ${styles.statusFailed}`}>FAILED</span></td>
							<td>
								<Link to="#" className={styles.actionLinkRetry}>
									Retry Payment
								</Link>
							</td>
						</tr>
					</tbody>
				</table>

				<div className={styles.tableFooter}>
					<div style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
						Showing 1 to 4 of 28 transactions
					</div>
					<div className={styles.pagination}>
						<button className={styles.pageBtn}>&lsaquo;</button>
						<button className={`${styles.pageBtn} ${styles.pageBtnActive}`}>1</button>
						<button className={styles.pageBtn}>2</button>
						<button className={styles.pageBtn}>3</button>
						<button className={styles.pageBtn}>&rsaquo;</button>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
};

export default Payments;
