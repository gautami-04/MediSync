import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import styles from "./Settings.module.css";

const Settings = () => {
	const [activeTab, setActiveTab] = useState("Profile");
	
	const [alerts, setAlerts] = useState({
		email: true,
		sms: false,
		newsletter: true
	});

	const toggleAlert = (key) => {
		setAlerts(prev => ({...prev, [key]: !prev[key]}));
	};

	return (
		<DashboardLayout activePath="/settings">
			<div className={styles.header}>
				<div>
					<h1 className={styles.headerTitle}>Settings</h1>
					<p className={styles.headerSubtitle}>Manage your portal preferences and account security</p>
				</div>
				
				<div className={styles.tabsContainer}>
					{["Profile", "Security", "Notifications", "Preferences"].map(tab => (
						<button 
							key={tab}
							className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
							onClick={() => setActiveTab(tab)}
						>
							{tab}
						</button>
					))}
				</div>
			</div>

			<div className={styles.settingsGrid}>
				<div className={styles.leftCol}>
					<div className={styles.card}>
						<div className={styles.profileHeader}>
							<div className={styles.profileImageWrapper}>
								<img src="https://ui-avatars.com/api/?name=Alexander+Thompson&background=random" alt="Profile" className={styles.profileImage} />
								<div className={styles.editImageBtn}>
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
								</div>
							</div>
							<div>
								<h2 className={styles.cardTitle}>Personal Details</h2>
								<p className={styles.cardDesc} style={{ marginBottom: 0 }}>Update your medical identity and contact information.</p>
								<div className={styles.badges}>
									<span className={`${styles.badge} ${styles.badgeVerified}`}>VERIFIED PATIENT</span>
									<span className={`${styles.badge} ${styles.badgePremium}`}>PREMIUM PLAN</span>
								</div>
							</div>
						</div>

						<div className={styles.formGrid}>
							<div className={styles.formGroup}>
								<label className={styles.label}>FULL NAME</label>
								<input type="text" className={styles.input} defaultValue="Alexander Thompson" />
							</div>
							<div className={styles.formGroup}>
								<label className={styles.label}>EMAIL ADDRESS</label>
								<input type="email" className={styles.input} defaultValue="alex.thompson@health.com" />
							</div>
							<div className={styles.formGroup}>
								<label className={styles.label}>PHONE NUMBER</label>
								<input type="tel" className={styles.input} defaultValue="+1 (555) 012-3456" />
							</div>
							<div className={styles.formGroup}>
								<label className={styles.label}>DATE OF BIRTH</label>
								<input type="date" className={styles.input} defaultValue="1992-05-14" />
							</div>
							<div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
								<label className={styles.label}>BLOOD GROUP</label>
								<select className={styles.input} defaultValue="A+">
									<option value="A+">A Positive (A+)</option>
									<option value="A-">A Negative (A-)</option>
									<option value="B+">B Positive (B+)</option>
									<option value="B-">B Negative (B-)</option>
									<option value="O+">O Positive (O+)</option>
									<option value="O-">O Negative (O-)</option>
									<option value="AB+">AB Positive (AB+)</option>
									<option value="AB-">AB Negative (AB-)</option>
								</select>
							</div>
						</div>
					</div>

					<div className={styles.card}>
						<h2 className={styles.cardTitle}>Security</h2>
						<p className={styles.cardDesc}>Keep your clinical data secure by updating passwords regularly.</p>
						
						<div className={styles.formGrid} style={{ marginBottom: "24px" }}>
							<div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
								<label className={styles.label}>CURRENT PASSWORD</label>
								<input type="password" className={styles.input} defaultValue="password123" />
							</div>
							<div className={styles.formGroup}>
								<label className={styles.label}>NEW PASSWORD</label>
								<input type="password" className={styles.input} />
							</div>
							<div className={styles.formGroup}>
								<label className={styles.label}>CONFIRM NEW PASSWORD</label>
								<input type="password" className={styles.input} />
							</div>
						</div>
					</div>
				</div>

				<div className={styles.rightCol}>
					<div className={styles.card}>
						<div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
							<div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--input-bg)", color: "var(--brand-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
							</div>
							<h2 className={styles.cardTitle} style={{ margin: 0 }}>Alerts</h2>
						</div>

						<div className={styles.toggleRow}>
							<div>
								<div className={styles.toggleLabel}>Email Alerts</div>
								<div className={styles.toggleDesc}>Appointment reminders</div>
							</div>
							<div className={`${styles.toggleSwitch} ${alerts.email ? styles.active : ""}`} onClick={() => toggleAlert('email')}></div>
						</div>
						<div className={styles.toggleRow}>
							<div>
								<div className={styles.toggleLabel}>SMS Alerts</div>
								<div className={styles.toggleDesc}>Critical health updates</div>
							</div>
							<div className={`${styles.toggleSwitch} ${alerts.sms ? styles.active : ""}`} onClick={() => toggleAlert('sms')}></div>
						</div>
						<div className={styles.toggleRow}>
							<div>
								<div className={styles.toggleLabel}>Newsletter</div>
								<div className={styles.toggleDesc}>Monthly clinical insights</div>
							</div>
							<div className={`${styles.toggleSwitch} ${alerts.newsletter ? styles.active : ""}`} onClick={() => toggleAlert('newsletter')}></div>
						</div>
					</div>

					<div className={styles.card} style={{ background: "var(--input-bg)", boxShadow: "none" }}>
						<h3 style={{ margin: "0 0 16px", fontSize: "0.85rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px" }}>Last Active Sessions</h3>
						
						<div className={styles.sessionItem}>
							<div className={styles.sessionIcon}>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
							</div>
							<div>
								<div className={styles.sessionTitle}>MacBook Pro - London</div>
								<div className={`${styles.sessionDesc} ${styles.sessionActive}`}>Active Now • Chrome</div>
							</div>
						</div>
						
						<div className={styles.sessionItem}>
							<div className={styles.sessionIcon}>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
							</div>
							<div>
								<div className={styles.sessionTitle}>iPhone 15 - London</div>
								<div className={styles.sessionDesc}>2 hours ago • MediSync App</div>
							</div>
						</div>

						<button className={styles.logoutAllBtn}>Log out from all devices</button>
					</div>

					<div className={styles.actionGrid}>
						<button className={styles.saveBtn}>Save All Changes</button>
						<button className={styles.discardBtn}>Discard</button>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
};

export default Settings;
