import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import InputField from "../../components/InputField";
import { registerUser } from "../../services/authService";
import { validateRegisterForm } from "../../utils/validators";
import styles from "./AuthPages.module.css";

const visibleRegisterFields = ["fullName", "email", "password", "confirmPassword"];

const initialForm = {
	fullName: "",
	email: "",
	phone: "",
	password: "",
	confirmPassword: "",
};

const Register = () => {
	const [role, setRole] = useState("patient");
	const [form, setForm] = useState(initialForm);
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const [alert, setAlert] = useState(null);
	const [agreed, setAgreed] = useState(false);
	const navigate = useNavigate();

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

	const handleSubmit = async (event) => {
		event.preventDefault();

		const fullValidationErrors = validateRegisterForm(form, role);
		const validationErrors = Object.fromEntries(
			Object.entries(fullValidationErrors).filter(([field]) =>
				visibleRegisterFields.includes(field)
			)
		);

		if (!String(form.phone || "").trim()) {
			validationErrors.phone = "Phone number is required.";
		}

		setErrors(validationErrors);

		if (Object.keys(validationErrors).length > 0) {
			return;
		}

		if (!agreed) {
			setErrors(prev => ({...prev, agree: "You must agree to the terms"}));
			return;
		}

		if (form.password !== form.confirmPassword) {
			setErrors(prev => ({...prev, confirmPassword: "Passwords do not match"}));
			return;
		}

		const payload = {
			role,
			fullName: form.fullName.trim(),
			email: form.email.trim(),
			password: form.password,
		};

		setLoading(true);
		setAlert(null);

		try {
			const response = await registerUser(payload);
			const devOtp = response?.devOtp || "";

			setAlert({
				type: "success",
				message: devOtp
					? `Registration started. Dev OTP: ${devOtp}`
					: "Registration successful. Please verify your OTP.",
			});

			navigate("/verify-otp", {
				state: { email: payload.email, devOtp },
			});
		} catch (error) {
			setAlert({
				type: "error",
				message:
					error?.response?.data?.message ||
					error?.message ||
					"Registration failed. Please try again.",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={styles.page}>
			<div className={styles.registerLayout}>
				<div className={styles.registerHeader}>
					<div className={styles.brand} style={{ color: "var(--bg-dark)" }}>
						<span className={styles.brandIcon}>
							<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
								<path d="M19 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.11 21 21 20.1 21 19V5C21 3.9 20.11 3 19 3ZM17 13H13V17H11V13H7V11H11V7H13V11H17V13Z" />
							</svg>
						</span>
						MediSync
					</div>
					<div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-secondary)" }}>
						Already have an account? <Link to="/login" style={{ background: "var(--input-bg)", padding: "8px 16px", borderRadius: "99px", color: "var(--text-primary)", textDecoration: "none", marginLeft: "8px" }}>Sign In</Link>
					</div>
				</div>

				<div className={styles.registerContentGrid}>
					<div style={{ display: "flex", flexDirection: "column" }}>
						<div style={{ textTransform: "uppercase", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", letterSpacing: "1px" }}>REGISTRATION</div>
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
							<h1 style={{ fontSize: "2.5rem", margin: "8px 0 0", color: "var(--bg-dark)", fontWeight: 700 }}>Create your account</h1>
							<div style={{ textAlign: "right" }}>
								<div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "8px" }}>Step 1 of 2</div>
								<div style={{ width: "100px", height: "4px", background: "var(--input-bg)", borderRadius: "2px", display: "flex" }}>
									<div style={{ width: "50%", height: "100%", background: "var(--brand-primary)", borderRadius: "2px" }}></div>
								</div>
							</div>
						</div>

						<div className={styles.roleTabs}>
							{["Patient", "Doctor", "Admin"].map(r => (
								<button
									key={r}
									type="button"
									className={`${styles.roleTab} ${role === r.toLowerCase() ? styles.roleTabActive : ""}`}
									onClick={() => setRole(r.toLowerCase())}
								>
									{r}
								</button>
							))}
						</div>

						<div style={{ background: "var(--input-bg)", borderRadius: "16px", padding: "16px 20px", display: "flex", gap: "16px", marginBottom: "32px", alignItems: "flex-start" }}>
							<div style={{ background: "var(--brand-primary)", color: "white", borderRadius: "50%", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 700, fontSize: "0.8rem" }}>i</div>
							<div>
								<div style={{ fontWeight: 700, color: "var(--bg-dark)", fontSize: "0.95rem" }}>Verification Required</div>
								<div style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "4px" }}>After completing this step, we'll send a 6-digit OTP to your email for secure verification.</div>
							</div>
						</div>

						{alert ? (
							<div className={`${styles.alert} ${alert.type === "success" ? styles.successAlert : styles.errorAlert}`} role="alert">
								{alert.message}
							</div>
						) : null}

						<form className={styles.form} onSubmit={handleSubmit} noValidate>
							<div className={styles.fieldGrid}>
								<div style={{position: "relative"}}>
									<InputField label="FULL NAME" name="fullName" value={form.fullName} onChange={handleChange} placeholder="e.g. Dr. Julian Pierce" error={errors.fullName} required />
									<div style={{ position: "absolute", left: "16px", top: "42px", color: "#8fa69d", pointerEvents: "none" }}>
										<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
									</div>
									<style>{`#fullName { padding-left: 44px; }`}</style>
								</div>
								
								<div style={{position: "relative"}}>
									<InputField label="EMAIL ADDRESS" name="email" type="email" value={form.email} onChange={handleChange} placeholder="julian.p@example.com" error={errors.email} required />
									<div style={{ position: "absolute", left: "16px", top: "42px", color: "#8fa69d", pointerEvents: "none" }}>
										<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
									</div>
									<style>{`#email { padding-left: 44px; }`}</style>
								</div>

								<div style={{position: "relative"}}>
									<InputField label="PHONE NUMBER" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" error={errors.phone} required />
									<div style={{ position: "absolute", left: "16px", top: "42px", color: "#8fa69d", pointerEvents: "none" }}>
										<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
									</div>
									<style>{`#phone { padding-left: 44px; }`}</style>
								</div>

								<div style={{position: "relative"}}>
									<InputField label="PASSWORD" name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••••••" error={errors.password} required />
									<div style={{ position: "absolute", left: "16px", top: "42px", color: "#8fa69d", pointerEvents: "none" }}>
										<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
									</div>
									<style>{`#password { padding-left: 44px; }`}</style>
								</div>

								<div style={{position: "relative"}}>
									<InputField label="CONFIRM PASSWORD" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••••••" error={errors.confirmPassword} required />
									<div style={{ position: "absolute", left: "16px", top: "42px", color: "#8fa69d", pointerEvents: "none" }}>
										<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
									</div>
									<style>{`#confirmPassword { padding-left: 44px; }`}</style>
								</div>
							</div>

							<label className={styles.checkboxRow} style={{ marginTop: "16px", marginBottom: "16px" }}>
								<input type="checkbox" className={styles.checkbox} checked={agreed} onChange={(e) => {
									setAgreed(e.target.checked);
									if (e.target.checked) {
										setErrors(prev => ({...prev, agree: ""}));
									}
								}} />
								<span>I agree to the <span style={{ color: "var(--brand-primary)", fontWeight: 700 }}>Terms of Service</span> and <span style={{ color: "var(--brand-primary)", fontWeight: 700 }}>Privacy Policy</span></span>
							</label>
							{errors.agree && <p className={styles.errorText} style={{marginTop: "-12px"}}>{errors.agree}</p>}

							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
								<div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", maxWidth: "250px", lineHeight: 1.5 }}>
									Your data is encrypted using 256-bit AES protocols for clinical safety.
								</div>
								<div style={{ width: "200px" }}>
									<Button type="submit" loading={loading}>
										Continue to Step 2 &rarr;
									</Button>
								</div>
							</div>
						</form>
					</div>

					<div className={styles.registerImageWrapper}>
						<img src="/images/clinic_setup.png" alt="Clinic Setup" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} />
						<div style={{ position: "absolute", bottom: "24px", right: "24px", color: "white", fontSize: "2rem", fontWeight: 700, lineHeight: 1.1, textAlign: "right" }}>
							Break<br/>through<br/>design.
						</div>
					</div>
				</div>

				<div style={{ display: "flex", justifyContent: "center", gap: "32px", marginTop: "40px", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", letterSpacing: "1px" }}>
					<div style={{ display: "flex", alignItems: "center", gap: "8px" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"></path></svg> HIPAA COMPLIANT</div>
					<div style={{ display: "flex", alignItems: "center", gap: "8px" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"></path></svg> 256-BIT SSL</div>
					<div style={{ display: "flex", alignItems: "center", gap: "8px" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"></path></svg> GDPR READY</div>
				</div>
				<div style={{ textAlign: "center", marginTop: "16px", fontSize: "0.7rem", color: "var(--text-secondary)", letterSpacing: "1px", textTransform: "uppercase" }}>
					&copy; 2024 MEDISYNC CLINICAL SOLUTIONS. ALL RIGHTS RESERVED.
				</div>
			</div>
		</div>
	);
};

export default Register;
