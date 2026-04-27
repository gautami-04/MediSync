import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import InputField from "../../components/InputField";
import { resetPassword, sendOtp, verifyOtp } from "../../services/authService";
import { validateForgotEmail, validateOtp, validatePasswordReset } from "../../utils/validators";
import OtpInput from "../../components/OtpInput";
import styles from "./AuthPages.module.css";

const OTP_LENGTH = 6;

const ForgotPassword = () => {
	const [step, setStep] = useState(1);
	const [email, setEmail] = useState("");
	const [otpDigits, setOtpDigits] = useState(() => Array(OTP_LENGTH).fill(""));
	const [resetForm, setResetForm] = useState({
		newPassword: "",
		confirmPassword: "",
	});
	const [errors, setErrors] = useState({});
	const [alert, setAlert] = useState(null);
	const [loading, setLoading] = useState(false);
	const [resendCountdown, setResendCountdown] = useState(30);
	const inputRefs = useRef([]);
	const navigate = useNavigate();

	const otp = otpDigits.join("");

	useEffect(() => {
		if (step !== 2 || resendCountdown <= 0) {
			return undefined;
		}

		const timer = window.setInterval(() => {
			setResendCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
		}, 1000);

		return () => window.clearInterval(timer);
	}, [step, resendCountdown]);

	const handleOtpChange = (index, value) => {
		const cleaned = String(value || "").replace(/\D/g, "");
		const nextDigits = [...otpDigits];
		nextDigits[index] = cleaned.slice(-1);
		setOtpDigits(nextDigits);

		if (cleaned && index < OTP_LENGTH - 1) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleOtpKeyDown = (index, event) => {
		if (event.key === "Backspace" && !otpDigits[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}

		if (event.key === "ArrowLeft" && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}

		if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleIdentifyUser = async (e) => {
		e.preventDefault();
		const emailError = validateForgotEmail(email);

		if (emailError) {
			setErrors({ email: emailError });
			return;
		}

		setLoading(true);
		setErrors({});
		setAlert(null);

		try {
			await sendOtp({ email: email.trim(), purpose: "reset-password" });
			setOtpDigits(Array(OTP_LENGTH).fill(""));
			setResendCountdown(30);
			setStep(2);
			setAlert({
				type: "success",
				message: "User found. OTP sent to your email.",
			});
		} catch (error) {
			setAlert({
				type: "error",
				message:
					error?.response?.data?.message ||
					error?.message ||
					"Unable to find user. Please try again.",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleVerifyOtp = async (e) => {
		e.preventDefault();
		const otpError = validateOtp(otp);

		if (otpError) {
			setErrors({ otp: otpError });
			return;
		}

		setLoading(true);
		setErrors({});
		setAlert(null);

		try {
			await verifyOtp({ email: email.trim(), otp, purpose: "reset-password" });
			setStep(3);
			setAlert({
				type: "success",
				message: "OTP verified. Please set your new password.",
			});
		} catch (error) {
			setAlert({
				type: "error",
				message:
					error?.response?.data?.message ||
					error?.message ||
					"OTP verification failed. Please try again.",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleResendOtp = async () => {
		if (resendCountdown > 0) {
			return;
		}

		setLoading(true);
		setAlert(null);

		try {
			await sendOtp({ email: email.trim(), purpose: "reset-password" });
			setOtpDigits(Array(OTP_LENGTH).fill(""));
			setResendCountdown(30);
			setAlert({
				type: "success",
				message: "A new OTP has been sent.",
			});
		} catch (error) {
			setAlert({
				type: "error",
				message:
					error?.response?.data?.message ||
					error?.message ||
					"Failed to resend OTP.",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleResetPassword = async (e) => {
		e.preventDefault();
		const nextErrors = validatePasswordReset(resetForm);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			return;
		}

		setLoading(true);
		setErrors({});
		setAlert(null);

		try {
			await resetPassword({
				email: email.trim(),
				newPassword: resetForm.newPassword,
				confirmPassword: resetForm.confirmPassword,
			});

			setAlert({
				type: "success",
				message: "Password changed successfully. Redirecting to login...",
			});

			window.setTimeout(() => {
				navigate("/login", { replace: true });
			}, 1200);
		} catch (error) {
			setAlert({
				type: "error",
				message:
					error?.response?.data?.message ||
					error?.message ||
					"Failed to reset password.",
			});
		} finally {
			setLoading(false);
		}
	};

	const stepMeta = [
		{ num: 1, label: "IDENTIFY" },
		{ num: 2, label: "VERIFY" },
		{ num: 3, label: "RESET" },
	];

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
					Find your account, verify OTP, then create a new password.
				</p>

				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", position: "relative", padding: "0 24px" }}>
					<div style={{ position: "absolute", top: "12px", left: "40px", right: "40px", height: "2px", background: "var(--input-bg)", zIndex: 1 }}></div>
					<div style={{ position: "absolute", top: "12px", left: "40px", right: step === 1 ? "calc(100% - 40px)" : step === 2 ? "50%" : "40px", height: "2px", background: "var(--brand-primary)", zIndex: 1 }}></div>
					
					{stepMeta.map((item, i) => (
						<div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", position: "relative", zIndex: 2 }}>
							<div style={{ width: "26px", height: "26px", borderRadius: "50%", background: step > item.num ? "var(--brand-primary)" : (step === item.num ? "var(--brand-primary)" : "var(--input-bg)"), color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700 }}>
								{step > item.num ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"></path></svg> : item.num}
							</div>
							<div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "1px", color: step >= item.num ? "var(--text-primary)" : "var(--text-secondary)" }}>{item.label}</div>
						</div>
					))}
				</div>

				{alert ? (
					<div className={`${styles.alert} ${alert.type === "success" ? styles.successAlert : styles.errorAlert}`} role="alert">
						{alert.message}
					</div>
				) : null}

				{step === 1 ? (
					<form className={styles.form} onSubmit={handleIdentifyUser} noValidate>
						<InputField
							label="ACCOUNT EMAIL"
							name="forgotEmail"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="name@clinic.com"
							error={errors.email}
							required
						/>

						<Button type="submit" loading={loading}>
							Find User & Send OTP
						</Button>
					</form>
				) : null}

				{step === 2 ? (
					<>
						<div style={{ background: "var(--input-bg)", borderRadius: "16px", padding: "20px", textAlign: "center", marginBottom: "24px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
							Enter the 6-digit code sent to<br />
							<strong style={{ color: "var(--bg-dark)" }}>{email}</strong>
						</div>

						<form onSubmit={handleVerifyOtp}>
							<OtpInput 
								value={otp} 
								onChange={(val) => setOtpDigits(val.split('').concat(Array(OTP_LENGTH).fill('')).slice(0, OTP_LENGTH))}
								error={errors.otp}
							/>

							<Button type="submit" loading={loading} style={{ width: '100%', marginTop: '12px' }}>
								Verify Security Code
							</Button>
						</form>

						<div style={{ textAlign: "center", marginTop: "24px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
							Didn't receive the code? <button type="button" onClick={handleResendOtp} disabled={loading || resendCountdown > 0} style={{ border: "none", background: "transparent", color: "var(--brand-primary)", fontWeight: 700, cursor: loading || resendCountdown > 0 ? "not-allowed" : "pointer", textDecoration: "underline" }}>{resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend Code"}</button>
						</div>
					</>
				) : null}

				{step === 3 ? (
					<form className={styles.form} onSubmit={handleResetPassword} noValidate>
						<InputField
							label="NEW PASSWORD"
							name="newPassword"
							type="password"
							value={resetForm.newPassword}
							onChange={(e) => setResetForm((prev) => ({ ...prev, newPassword: e.target.value }))}
							placeholder="Enter new password"
							error={errors.newPassword}
							required
						/>

						<InputField
							label="CONFIRM PASSWORD"
							name="confirmPassword"
							type="password"
							value={resetForm.confirmPassword}
							onChange={(e) => setResetForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
							placeholder="Confirm new password"
							error={errors.confirmPassword}
							required
						/>

						<Button type="submit" loading={loading}>
							Save New Password
						</Button>
					</form>
				) : null}

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
