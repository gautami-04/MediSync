import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import InputField from "../../components/InputField";
import {
	requestPasswordReset,
	verifyResetOtp,
	resetPassword,
} from "../../services/authService";
import {
	validateForgotEmail,
	validateOtp,
	validatePasswordReset,
} from "../../utils/validators";
import styles from "./AuthPages.module.css";

const OTP_LENGTH = 6;

const ForgotPassword = () => {
	const [step, setStep] = useState(1); // 1: identify, 2: verify, 3: reset
	const [email, setEmail] = useState("");
	const [otpDigits, setOtpDigits] = useState(() => Array(OTP_LENGTH).fill(""));
	const [resetToken, setResetToken] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [errors, setErrors] = useState({});
	const [alert, setAlert] = useState(null);
	const [loading, setLoading] = useState(false);
	const [resendCountdown, setResendCountdown] = useState(0);
	const navigate = useNavigate();
	const inputRefs = useRef([]);

	useEffect(() => {
		if (resendCountdown <= 0) return undefined;

		const timer = window.setInterval(() => {
			setResendCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
		}, 1000);

		return () => window.clearInterval(timer);
	}, [resendCountdown]);

	const goToStep = (s) => {
		setStep(s);
		setAlert(null);
		setErrors({});
	};

	// Step 1: send OTP to email
	const handleSendOtp = async (e) => {
		e?.preventDefault?.();

		const emailError = validateForgotEmail(email);
		if (emailError) {
			setErrors({ email: emailError });
			return;
		}

		setLoading(true);
		try {
			await requestPasswordReset({ email: email.trim() });
			setAlert({ type: "success", message: "OTP sent to your email." });
			setResendCountdown(30);
			goToStep(2);
		} catch (err) {
			setAlert({ type: "error", message: err?.response?.data?.message || err?.message || "Failed to send OTP." });
		} finally {
			setLoading(false);
		}
	};

	// OTP input handlers
	const handleOtpChange = (index, value) => {
		const cleaned = String(value).replace(/\D/g, "");
		const next = [...otpDigits];
		next[index] = cleaned.slice(-1);
		setOtpDigits(next);
		setErrors((prev) => ({ ...prev, otp: "" }));

		if (cleaned && index < OTP_LENGTH - 1) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleOtpKeyDown = (index, event) => {
		if (event.key === "Backspace" && !otpDigits[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handleOtpPaste = (event) => {
		event.preventDefault();
		const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
		if (!pasted) return;
		setOtpDigits(Array.from({ length: OTP_LENGTH }).map((_, i) => pasted[i] || ""));
		const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
		inputRefs.current[focusIndex]?.focus();
	};

	// Step 2: verify OTP
	const handleVerifyOtp = async (e) => {
		e?.preventDefault?.();
		const otp = otpDigits.join("");
		const otpError = validateOtp(otp);
		if (otpError) {
			setErrors({ otp: otpError });
			return;
		}

		setLoading(true);
		try {
			const data = await verifyResetOtp({ email: email.trim(), otp });
			const token = data?.resetToken;
			if (!token) {
				setAlert({ type: "error", message: "Reset token not returned by server." });
				return;
			}
			setResetToken(token);
			setAlert({ type: "success", message: "OTP verified. Enter a new password." });
			goToStep(3);
		} catch (err) {
			setAlert({ type: "error", message: err?.response?.data?.message || err?.message || "OTP verification failed." });
		} finally {
			setLoading(false);
		}
	};

	const handleResend = async () => {
		if (resendCountdown > 0) return;
		setLoading(true);
		try {
			await requestPasswordReset({ email: email.trim() });
			setOtpDigits(Array(OTP_LENGTH).fill(""));
			setResendCountdown(30);
			setAlert({ type: "success", message: "A new OTP has been sent to your email." });
		} catch (err) {
			setAlert({ type: "error", message: err?.response?.data?.message || err?.message || "Failed to resend OTP." });
		} finally {
			setLoading(false);
		}
	};

	// Step 3: reset password
	const handleResetPassword = async (e) => {
		e?.preventDefault?.();

		const formErr = validatePasswordReset({ newPassword, confirmPassword });
		if (Object.keys(formErr).length) {
			setErrors(formErr);
			return;
		}

		setLoading(true);
		try {
			await resetPassword({ token: resetToken, newPassword });
			setAlert({ type: "success", message: "Password reset successful. Redirecting to login..." });
			setTimeout(() => navigate("/login"), 900);
		} catch (err) {
			setAlert({ type: "error", message: err?.response?.data?.message || err?.message || "Failed to reset password." });
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={styles.page}>
			<div className={styles.forgotLayout}>
				<h2 className={styles.heading} style={{ textAlign: "center" }}>Security Recovery</h2>
				<p className={styles.subHeading} style={{ textAlign: "center", marginTop: "8px" }}>
					Please follow the three-step verification process to securely reset your password.
				</p>

				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "24px 0", position: "relative", padding: "0 24px" }}>
					<div style={{ position: "absolute", top: "12px", left: "40px", right: "40px", height: "2px", background: "var(--input-bg)", zIndex: 1 }} />
					<div style={{ position: "absolute", top: "12px", left: "40px", right: step > 1 ? "40%" : "50%", height: "2px", background: "var(--brand-primary)", zIndex: 1 }} />

					{[{ num: 1, label: "IDENTIFY" }, { num: 2, label: "VERIFY" }, { num: 3, label: "RESET" }].map((s, i) => {
						const active = step >= s.num;
						const done = step > s.num;
						return (
							<div key={s.num} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", zIndex: 2 }}>
								<div style={{ width: "26px", height: "26px", borderRadius: "50%", background: done ? "var(--brand-primary)" : active ? "var(--brand-primary)" : "var(--input-bg)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700 }}>
									{done ? (
										<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"></path></svg>
									) : (
										s.num
									)}
								</div>
								<div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "1px", color: active ? "var(--text-primary)" : "var(--text-secondary)" }}>{s.label}</div>
							</div>
						);
					})}
				</div>

				{alert ? (
					<div className={`${styles.alert} ${alert.type === "success" ? styles.successAlert : styles.errorAlert}`} role="alert">
						{alert.message}
					</div>
				) : null}

				{step === 1 && (
					<form className={styles.form} onSubmit={handleSendOtp} noValidate>
						<InputField label="EMAIL" name="forgotEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" error={errors.email} required />
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
							<div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
								We'll send a 6-digit code to your email to verify your identity.
							</div>
							<div style={{ width: "200px" }}>
								<Button type="submit" loading={loading}>Send OTP &rarr;</Button>
							</div>
						</div>
						<p className={styles.footerText} style={{ marginTop: "16px" }}>Return to <Link to="/login">Login</Link></p>
					</form>
				)}

				{step === 2 && (
					<form className={styles.form} onSubmit={handleVerifyOtp} onPaste={handleOtpPaste} noValidate>
						<div style={{ background: "var(--input-bg)", borderRadius: "12px", padding: "16px", textAlign: "center", marginBottom: "12px" }}>
							Enter the 6-digit code sent to<br />
							<strong style={{ color: "var(--bg-dark)" }}>{email}</strong>
						</div>

						<div className={styles.otpRow}>
							{otpDigits.map((digit, index) => (
								<input
									key={index}
									id={`otp-${index}`}
									ref={(el) => (inputRefs.current[index] = el)}
									type="text"
									maxLength={1}
									inputMode="numeric"
									className={`${styles.otpInput} ${digit ? styles.otpInputFilled : ""}`}
									value={digit}
									onChange={(e) => handleOtpChange(index, e.target.value)}
									onKeyDown={(e) => handleOtpKeyDown(index, e)}
									aria-label={`OTP digit ${index + 1}`}
								/>
							))}
						</div>

						{errors.otp && <p className={styles.errorText}>{errors.otp}</p>}

						<Button type="submit" loading={loading}>Verify & Continue</Button>

						<button type="button" className={styles.textButton} onClick={handleResend} disabled={resendCountdown > 0} style={{ marginTop: "12px" }}>
							{resendCountdown > 0 ? `Resend OTP in ${resendCountdown}s` : "Resend OTP"}
						</button>

						<p className={styles.footerText} style={{ marginTop: "16px" }}>Return to <Link to="/login">Login</Link></p>
					</form>
				)}

				{step === 3 && (
					<form className={styles.form} onSubmit={handleResetPassword} noValidate>
						<InputField label="NEW PASSWORD" name="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" error={errors.newPassword} required />
						<InputField label="CONFIRM PASSWORD" name="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" error={errors.confirmPassword} required />

						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
							<div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Choose a strong password with uppercase, lowercase, number and special character.</div>
							<div style={{ width: "200px" }}>
								<Button type="submit" loading={loading}>Reset Password</Button>
							</div>
						</div>

						<p className={styles.footerText} style={{ marginTop: "16px" }}>Return to <Link to="/login">Login</Link></p>
					</form>
				)}
			</div>
		</div>
	);
};

export default ForgotPassword;
