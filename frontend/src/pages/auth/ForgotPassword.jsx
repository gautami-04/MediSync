import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/Button";
import styles from "./AuthPages.module.css";

const ForgotPassword = () => {
	const [otp, setOtp] = useState(["4", "9", "", "", "", ""]);
	const [loading, setLoading] = useState(false);

	const handleOtpChange = (index, value) => {
		if (!/^[0-9]*$/.test(value)) return;
		const newOtp = [...otp];
		newOtp[index] = value;
		setOtp(newOtp);
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		setLoading(true);
		setTimeout(() => setLoading(false), 1000);
	};

	return (
		<div className={styles.page} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
			<div className={styles.brand} style={{ color: "var(--bg-dark)", margin: "0 auto 16px" }}>
				<span className={styles.brandIcon}>
					<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
						<path d="M19 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.11 21 21 20.1 21 19V5C21 3.9 20.11 3 19 3ZM17 13H13V17H11V13H7V11H11V7H13V11H17V13Z" />
					</svg>
				</span>
				MediSync
			</div>

			<div className={styles.forgotLayout}>
				<h2 className={styles.heading} style={{ textAlign: "center", fontSize: "1.5rem" }}>Security Recovery</h2>
				<p className={styles.subHeading} style={{ textAlign: "center", fontSize: "0.85rem", marginTop: "12px", marginBottom: "32px", maxWidth: "300px", margin: "12px auto 32px" }}>
					Please follow the three-step verification process to securely reset your clinical portal password.
				</p>

				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", position: "relative", padding: "0 24px" }}>
					<div style={{ position: "absolute", top: "12px", left: "40px", right: "40px", height: "2px", background: "var(--input-bg)", zIndex: 1 }}></div>
					<div style={{ position: "absolute", top: "12px", left: "40px", right: "50%", height: "2px", background: "var(--brand-primary)", zIndex: 1 }}></div>
					
					{[
						{ num: 1, label: "IDENTIFY", active: true, done: true },
						{ num: 2, label: "VERIFY", active: true, done: false },
						{ num: 3, label: "RESET", active: false, done: false }
					].map((step, i) => (
						<div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", position: "relative", zIndex: 2 }}>
							<div style={{ width: "26px", height: "26px", borderRadius: "50%", background: step.done ? "var(--brand-primary)" : (step.active ? "var(--brand-primary)" : "var(--input-bg)"), color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700 }}>
								{step.done ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"></path></svg> : step.num}
							</div>
							<div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "1px", color: step.active ? "var(--text-primary)" : "var(--text-secondary)" }}>{step.label}</div>
						</div>
					))}
				</div>

				<div style={{ background: "var(--input-bg)", borderRadius: "16px", padding: "20px", textAlign: "center", marginBottom: "24px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
					Enter the 6-digit code sent to<br />
					<strong style={{ color: "var(--bg-dark)" }}>dr.johnson@medisync.com</strong>
				</div>

				<form onSubmit={handleSubmit}>
					<div className={styles.otpRow}>
						{otp.map((digit, index) => (
							<input
								key={index}
								type="text"
								maxLength={1}
								className={styles.otpInput}
								value={digit}
								onChange={(e) => handleOtpChange(index, e.target.value)}
							/>
						))}
					</div>

					<Button type="submit" loading={loading}>
						Verify & Continue &rarr;
					</Button>
				</form>

				<div style={{ textAlign: "center", marginTop: "24px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
					Didn't receive the code? <button type="button" style={{ border: "none", background: "transparent", color: "var(--brand-primary)", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>Resend Code</button>
				</div>

				<div style={{ textAlign: "center", marginTop: "32px", fontSize: "0.85rem" }}>
					<Link to="/login" style={{ color: "var(--text-secondary)", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
						&larr; Return to Sign In
					</Link>
				</div>
			</div>

			<div style={{ textAlign: "center", marginTop: "24px" }}>
				<div style={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--text-secondary)", letterSpacing: "1px", marginBottom: "16px" }}>SECURED BY MEDISYNC CLINICAL SYSTEMS</div>
				<div style={{ display: "flex", justifyContent: "center", gap: "24px", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
					<span>Help Center</span>
					<span>Privacy Policy</span>
					<span>Emergency Contact</span>
				</div>
			</div>
		</div>
	);
};

export default ForgotPassword;
