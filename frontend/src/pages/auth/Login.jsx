import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import InputField from "../../components/InputField";
import useAuth from "../../hooks/useAuth";
import { validateLoginForm } from "../../utils/validators";
import styles from "./AuthPages.module.css";

const initialForm = {
	email: "",
	password: "",
};

const Login = () => {
	const [form, setForm] = useState(initialForm);
	const [errors, setErrors] = useState({});
	const [alert, setAlert] = useState(null);
	const [keepSignedIn, setKeepSignedIn] = useState(false);
	const navigate = useNavigate();
	const { login, authLoading, isAuthenticated } = useAuth();

	useEffect(() => {
		if (isAuthenticated) {
			navigate("/home", { replace: true });
		}
	}, [isAuthenticated, navigate]);

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
		const validationErrors = validateLoginForm(form);
		setErrors(validationErrors);

		if (Object.keys(validationErrors).length > 0) {
			return;
		}

		setAlert(null);

		const result = await login({
			email: form.email.trim(),
			password: form.password,
		});

		if (!result.success) {
			setAlert({
				type: "error",
				message: result.message,
			});
			return;
		}

		setAlert({
			type: "success",
			message: "Login successful. Redirecting to dashboard...",
		});

		navigate("/home", { replace: true });
	};

	return (
		<div className={styles.page}>
			<div className={styles.loginLayout}>
				<aside className={styles.infoPanel}>
					<div className={styles.brand}>
						<span className={styles.brandIcon}>
							<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
								<path d="M19 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.11 21 21 20.1 21 19V5C21 3.9 20.11 3 19 3ZM17 13H13V17H11V13H7V11H11V7H13V11H17V13Z" />
							</svg>
						</span>
						MediSync
					</div>
					
					<h1 className={styles.infoTitle}>
						Your health,<br />
						<span style={{ borderBottom: "4px solid var(--brand-primary)", display: "inline-block", paddingBottom: "4px" }}>simplified</span>
					</h1>
					
					<div className={styles.infoImageWrapper}>
						<img src="/images/doctor_portrait.png" alt="Doctor" className={styles.infoImage} />
					</div>
					
					<div className={styles.securityBadge}>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4cd964" strokeWidth="2">
							<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
							<path d="M9 12l2 2 4-4" />
						</svg>
						<div>
							<div style={{fontWeight: 700, letterSpacing: "1px"}}>TRUSTED HEALTHCARE</div>
							<div style={{opacity: 0.8}}>HIPAA Compliant & Secure</div>
						</div>
					</div>
				</aside>

				<section className={styles.formPanel}>
					<h2 className={styles.heading}>Welcome Back</h2>
					<p className={styles.subHeading}>Access your personal clinical portal</p>

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
						<div style={{ position: "relative" }}>
							<InputField
								label="EMAIL ADDRESS"
								name="email"
								type="email"
								value={form.email}
								onChange={handleChange}
								placeholder="name@clinic.com"
								autoComplete="email"
								error={errors.email}
								required
							/>
							<div style={{ position: "absolute", right: "20px", top: "42px", color: "#8fa69d", pointerEvents: "none", fontWeight: 700, fontSize: "1.2rem" }}>@</div>
						</div>

						<div style={{ position: "relative" }}>
							<div style={{ position: "absolute", right: "0", top: "0", fontSize: "0.75rem", fontWeight: 700 }}>
								<Link to="/forgot-password" style={{ color: "var(--brand-primary)", textDecoration: "none" }}>Forgot password?</Link>
							</div>
							<InputField
								label="PASSWORD"
								name="password"
								type="password"
								value={form.password}
								onChange={handleChange}
								placeholder="••••••••"
								autoComplete="current-password"
								error={errors.password}
								required
							/>
							<div style={{ position: "absolute", right: "20px", top: "42px", color: "#4a6659", pointerEvents: "none" }}>
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
									<path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
								</svg>
							</div>
						</div>

						<label className={styles.checkboxRow}>
							<input 
								type="checkbox" 
								className={styles.checkbox}
								checked={keepSignedIn}
								onChange={(e) => setKeepSignedIn(e.target.checked)}
							/>
							Keep me signed in for 30 days
						</label>

						<Button type="submit" loading={authLoading}>
							Sign In &rarr;
						</Button>
					</form>

					<p className={styles.footerText}>
						New to MediSync? <Link to="/register">Create an account</Link>
					</p>
					
					<div className={styles.trustIndicators}>
						<div className={styles.trustItem}>
							<div className={styles.trustValue}>24/7</div>
							<div className={styles.trustLabel}>SUPPORT ACCESS</div>
						</div>
						<div className={styles.trustItem}>
							<div className={styles.trustValue}>100%</div>
							<div className={styles.trustLabel}>DATA PRIVACY</div>
						</div>
						<div className={styles.trustItem}>
							<div className={styles.trustValue}>4.9/5</div>
							<div className={styles.trustLabel}>PATIENT RATING</div>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
};

export default Login;
