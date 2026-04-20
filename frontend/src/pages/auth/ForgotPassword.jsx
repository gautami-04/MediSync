import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import InputField from "../../components/InputField";
import { sendOtp } from "../../services/authService";
import {
	getPasswordStrength,
	validateForgotEmail,
	validatePasswordReset,
} from "../../utils/validators";
import styles from "./AuthPages.module.css";

const ForgotPassword = () => {
	const [email, setEmail] = useState("");
	const [resetForm, setResetForm] = useState({
		newPassword: "",
		confirmPassword: "",
	});
	const [step, setStep] = useState("request");
	const [errors, setErrors] = useState({});
	const [alert, setAlert] = useState(null);
	const [loading, setLoading] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const navigate = useNavigate();
	const passwordStrength = getPasswordStrength(resetForm.newPassword);

	const strengthToneClass = {
		weak: styles.strengthWeak,
		medium: styles.strengthMedium,
		strong: styles.strengthStrong,
		none: styles.strengthNone,
	}[passwordStrength.tone];

	const handleSendOtp = async (event) => {
		event.preventDefault();
		const emailError = validateForgotEmail(email);

		if (emailError) {
			setErrors({ email: emailError });
			return;
		}

		setLoading(true);
		setAlert(null);

		try {
			await sendOtp({ email: email.trim() });
			setErrors({});
			setStep("reset");
			setAlert({
				type: "success",
				message: "OTP sent to your email. You can now set a new password.",
			});
		} catch (error) {
			setAlert({
				type: "error",
				message:
					error?.response?.data?.message ||
					error?.message ||
					"Failed to send OTP. Please try again.",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleResetFieldChange = (event) => {
		const { name, value } = event.target;

		setResetForm((prev) => ({
			...prev,
			[name]: value,
		}));

		setErrors((prev) => ({
			...prev,
			[name]: "",
		}));
	};

	const handleResetPassword = (event) => {
		event.preventDefault();

		const validationErrors = validatePasswordReset(resetForm);
		setErrors(validationErrors);

		if (Object.keys(validationErrors).length > 0) {
			return;
		}

		setAlert({
			type: "success",
			message: "Password reset UI completed. Please proceed to login.",
		});

		setResetForm({ newPassword: "", confirmPassword: "" });
		setStep("request");
		navigate("/login");
	};

	return (
		<div className={styles.page}>
			<div className={styles.layout}>
				<aside className={styles.infoPanel}>
					<p className={styles.brand}>MediSync Digital Health</p>
					<h1 className={styles.infoTitle}>Password recovery in two quick steps.</h1>
					<p className={styles.infoText}>
						Request a one-time OTP and securely set your new password to regain account access.
					</p>
					<div className={styles.infoBadge}>Secure reset flow designed for healthcare users.</div>
				</aside>

				<section className={styles.formPanel}>
					<h2 className={styles.heading}>Forgot Password</h2>
					<p className={styles.subHeading}>Request OTP and set a fresh password.</p>

					{alert ? (
						<div
							className={`${styles.alert} ${
								alert.type === "success" ? styles.successAlert : styles.errorAlert
							}`}
							role="alert"
						>
							{alert.message}
						</div>
					) : null}

					{step === "request" ? (
						<form className={styles.form} onSubmit={handleSendOtp} noValidate>
							<InputField
								label="Email"
								name="email"
								type="email"
								value={email}
								onChange={(event) => {
									setEmail(event.target.value);
									setErrors((prev) => ({ ...prev, email: "" }));
								}}
								placeholder="name@hospital.com"
								autoComplete="email"
								error={errors.email}
								required
							/>

							<Button type="submit" loading={loading}>
								Send OTP
							</Button>
						</form>
					) : (
						<form className={styles.form} onSubmit={handleResetPassword} noValidate>
							<InputField
								label="New Password"
								name="newPassword"
								type={showNewPassword ? "text" : "password"}
								value={resetForm.newPassword}
								onChange={handleResetFieldChange}
								placeholder="Minimum 8 characters"
								autoComplete="new-password"
								trailingButtonText={showNewPassword ? "Hide" : "Show"}
								onTrailingButtonClick={() => setShowNewPassword((prev) => !prev)}
								trailingButtonAriaLabel="Toggle new password visibility"
								error={errors.newPassword}
								required
							/>

							<InputField
								label="Confirm Password"
								name="confirmPassword"
								type={showConfirmPassword ? "text" : "password"}
								value={resetForm.confirmPassword}
								onChange={handleResetFieldChange}
								placeholder="Re-enter password"
								autoComplete="new-password"
								trailingButtonText={showConfirmPassword ? "Hide" : "Show"}
								onTrailingButtonClick={() => setShowConfirmPassword((prev) => !prev)}
								trailingButtonAriaLabel="Toggle confirm password visibility"
								error={errors.confirmPassword}
								required
							/>

							<div className={styles.passwordMeta}>
								<div className={styles.passwordMetaRow}>
									<span>Password strength</span>
									<span>{passwordStrength.label || "Not set"}</span>
								</div>
								<div className={styles.strengthTrack}>
									<div
										className={`${styles.strengthFill} ${strengthToneClass || styles.strengthNone}`}
										style={{ width: `${passwordStrength.percent}%` }}
									/>
								</div>
							</div>

							<Button type="submit">Reset Password</Button>
						</form>
					)}

					<p className={styles.footerText}>
						Remembered your password? <Link to="/login">Back to login</Link>
					</p>
				</section>
			</div>
		</div>
	);
};

export default ForgotPassword;
