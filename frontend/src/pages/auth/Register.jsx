import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import InputField from "../../components/InputField";
import RoleSelector from "../../components/RoleSelector";
import { registerUser } from "../../services/authService";
import { getPasswordStrength, validateRegisterForm } from "../../utils/validators";
import styles from "./AuthPages.module.css";

const initialForm = {
	fullName: "",
	email: "",
	password: "",
	confirmPassword: "",
	age: "",
	gender: "",
	specialization: "",
	experience: "",
	consultationFee: "",
};

const Register = () => {
	const [role, setRole] = useState("patient");
	const [form, setForm] = useState(initialForm);
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const [alert, setAlert] = useState(null);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [capsLockOn, setCapsLockOn] = useState(false);
	const navigate = useNavigate();
	const passwordStrength = getPasswordStrength(form.password);

	const strengthToneClass = {
		weak: styles.strengthWeak,
		medium: styles.strengthMedium,
		strong: styles.strengthStrong,
		none: styles.strengthNone,
	}[passwordStrength.tone];

	const handleChange = (event) => {
		const { name, value } = event.target;

		setForm((prev) => ({
			...prev,
			[name]: value,
		}));

		setErrors((prev) => ({
			...prev,
			[name]: "",
		}));
	};

	const handleRoleChange = (nextRole) => {
		setRole(nextRole);
		setErrors({});
		setAlert(null);
	};

	const buildPayload = () => {
		const basePayload = {
			role,
			fullName: form.fullName.trim(),
			email: form.email.trim(),
			password: form.password,
		};

		if (role === "patient") {
			return {
				...basePayload,
				age: Number(form.age),
				gender: form.gender,
			};
		}

		return {
			...basePayload,
			specialization: form.specialization.trim(),
			experience: Number(form.experience),
			consultationFee: Number(form.consultationFee),
		};
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		const validationErrors = validateRegisterForm(form, role);
		setErrors(validationErrors);

		if (Object.keys(validationErrors).length > 0) {
			return;
		}

		const payload = buildPayload();
		setLoading(true);
		setAlert(null);

		try {
			await registerUser(payload);

			setAlert({
				type: "success",
				message: "Registration successful. Please verify your OTP.",
			});

			navigate("/verify-otp", {
				state: { email: payload.email },
			});
		} catch (error) {
			setAlert({
				type: "error",
				message:
					error?.response?.data?.message ||
					error?.message ||
					"Registration failed. Please check your details and try again.",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={styles.page}>
			<div className={styles.layout}>
				<aside className={styles.infoPanel}>
					<p className={styles.brand}>MediSync Digital Health</p>
					<h1 className={styles.infoTitle}>Create your healthcare access account.</h1>
					<p className={styles.infoText}>
						Register as a patient or doctor and start using secure digital healthcare services.
					</p>
					<div className={styles.infoBadge}>Fast registration with role-specific onboarding.</div>
				</aside>

				<section className={styles.formPanel}>
					<h2 className={styles.heading}>Register</h2>
					<p className={styles.subHeading}>Choose your role and complete your profile details.</p>

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

					<form className={styles.form} onSubmit={handleSubmit} noValidate>
						<RoleSelector value={role} onChange={handleRoleChange} />

						<div className={styles.fieldGrid}>
							<InputField
								label="Full Name"
								name="fullName"
								value={form.fullName}
								onChange={handleChange}
								placeholder="Dr. Asha Menon"
								error={errors.fullName}
								required
							/>

							<InputField
								label="Email"
								name="email"
								type="email"
								value={form.email}
								onChange={handleChange}
								placeholder="name@hospital.com"
								autoComplete="email"
								error={errors.email}
								required
							/>

							<InputField
								label="Password"
								name="password"
								type={showPassword ? "text" : "password"}
								value={form.password}
								onChange={handleChange}
								onKeyUp={(event) => setCapsLockOn(event.getModifierState("CapsLock"))}
								placeholder="Minimum 8 characters"
								autoComplete="new-password"
								helperText={capsLockOn ? "Caps Lock is ON." : "Use uppercase, lowercase, number, and symbol."}
								trailingButtonText={showPassword ? "Hide" : "Show"}
								onTrailingButtonClick={() => setShowPassword((prev) => !prev)}
								trailingButtonAriaLabel="Toggle password visibility"
								error={errors.password}
								required
							/>

							<InputField
								label="Confirm Password"
								name="confirmPassword"
								type={showConfirmPassword ? "text" : "password"}
								value={form.confirmPassword}
								onChange={handleChange}
								placeholder="Re-enter password"
								autoComplete="new-password"
								trailingButtonText={showConfirmPassword ? "Hide" : "Show"}
								onTrailingButtonClick={() => setShowConfirmPassword((prev) => !prev)}
								trailingButtonAriaLabel="Toggle confirm password visibility"
								error={errors.confirmPassword}
								required
							/>

							<div className={styles.fieldGridWide}>
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
							</div>

							{role === "patient" ? (
								<>
									<InputField
										label="Age"
										name="age"
										type="number"
										value={form.age}
										onChange={handleChange}
										placeholder="Enter age"
										min="0"
										max="120"
										error={errors.age}
										required
									/>

									<div className={styles.selectWrap}>
										<label htmlFor="gender" className={styles.selectLabel}>
											Gender<span className={styles.required}>*</span>
										</label>
										<select
											id="gender"
											name="gender"
											value={form.gender}
											onChange={handleChange}
											className={`${styles.selectInput} ${errors.gender ? styles.selectError : ""}`}
										>
											<option value="">Select Gender</option>
											<option value="male">Male</option>
											<option value="female">Female</option>
											<option value="other">Other</option>
										</select>
										{errors.gender ? <p className={styles.errorText}>{errors.gender}</p> : null}
									</div>
								</>
							) : (
								<>
									<InputField
										label="Specialization"
										name="specialization"
										value={form.specialization}
										onChange={handleChange}
										placeholder="Cardiology"
										error={errors.specialization}
										required
									/>

									<InputField
										label="Experience (Years)"
										name="experience"
										type="number"
										value={form.experience}
										onChange={handleChange}
										placeholder="8"
										min="0"
										error={errors.experience}
										required
									/>

									<InputField
										label="Consultation Fee"
										name="consultationFee"
										type="number"
										value={form.consultationFee}
										onChange={handleChange}
										placeholder="1500"
										min="1"
										error={errors.consultationFee}
										required
									/>
								</>
							)}
						</div>

						<Button type="submit" loading={loading}>
							Create Account
						</Button>
					</form>

					<p className={styles.footerText}>
						Already registered? <Link to="/login">Back to login</Link>
					</p>
				</section>
			</div>
		</div>
	);
};

export default Register;
