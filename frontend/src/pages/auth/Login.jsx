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
	const [showPassword, setShowPassword] = useState(false);
	const [capsLockOn, setCapsLockOn] = useState(false);
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

	const fillDemoCredentials = () => {
		setForm({
			email: "doctor@medisync.com",
			password: "Doctor@123",
		});
		setErrors({});
		setAlert(null);
	};

	return (
		<div className={styles.page}>
			<div className={styles.layout}>
				<aside className={styles.infoPanel}>
					<p className={styles.brand}>MediSync Digital Health</p>
					<h1 className={styles.infoTitle}>Secure sign-in for clinicians and patients.</h1>
					<p className={styles.infoText}>
						Access appointments, records, and telehealth tools through a protected and
						streamlined authentication workflow.
					</p>
					<div className={styles.infoBadge}>Trusted sessions. Role-based access. Fast onboarding.</div>
				</aside>

				<section className={styles.formPanel}>
					<h2 className={styles.heading}>Login</h2>
					<p className={styles.subHeading}>Sign in to continue to your healthcare dashboard.</p>

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
							placeholder="Enter your password"
							autoComplete="current-password"
							helperText={capsLockOn ? "Caps Lock is ON." : ""}
							trailingButtonText={showPassword ? "Hide" : "Show"}
							onTrailingButtonClick={() => setShowPassword((prev) => !prev)}
							trailingButtonAriaLabel="Toggle password visibility"
							error={errors.password}
							required
						/>

						<div className={styles.helperRow}>
							<button type="button" className={styles.textMiniButton} onClick={fillDemoCredentials}>
								Use demo credentials
							</button>
							<Link to="/forgot-password" className={styles.link}>
								Forgot Password?
							</Link>
						</div>

						<Button type="submit" loading={authLoading}>
							Login
						</Button>
					</form>

					<p className={styles.footerText}>
						Need an account? <Link to="/register">Register now</Link>
					</p>
				</section>
			</div>
		</div>
	);
};

export default Login;
