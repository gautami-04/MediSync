import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import InputField from "../../components/InputField";
import useAuth from "../../hooks/useAuth";
import { validateLoginForm } from "../../utils/validators";
import styles from "./AuthPages.module.css";

const Login = () => {
	const [form, setForm] = useState({ email: "", password: "" });
	const [errors, setErrors] = useState({});
	const [alert, setAlert] = useState(null);
	const navigate = useNavigate();
	const { login, authLoading, isAuthenticated } = useAuth();

	useEffect(() => {
		if (isAuthenticated) navigate("/home", { replace: true });
	}, [isAuthenticated, navigate]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm(prev => ({ ...prev, [name]: value }));
		setErrors(prev => ({ ...prev, [name]: "" }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const valErrors = validateLoginForm(form);
		setErrors(valErrors);
		if (Object.keys(valErrors).length > 0) return;

		setAlert(null);
		try {
			const res = await login(form);
			if (!res.success) {
				setAlert({ type: "error", message: res.message });
			}
		} catch (err) {
			setAlert({ type: "error", message: "A technical error occurred. Please try again." });
		}
	};

	return (
		<div className={styles.page}>
			<div className={styles.loginLayout}>
				<div className={styles.brand}>MediSync</div>
				<h1 className={styles.title}>Sign In</h1>
				<p style={{textAlign: 'center', color: 'var(--text-muted)'}}>
					Need an account? <Link to="/register" style={{color: 'var(--primary)', fontWeight: 700}}>Register</Link>
				</p>

				{alert && <div className={`${styles.alert} ${styles.errorAlert}`}>{alert.message}</div>}

				<form className={styles.form} onSubmit={handleSubmit} noValidate>
					<InputField 
						label="Email Address" 
						name="email" 
						value={form.email} 
						onChange={handleChange} 
						placeholder="admin1234@gmail.com" 
						error={errors.email} 
						required 
					/>
					
					<div style={{ position: "relative" }}>
						<Link to="/forgot-password" style={{ position: "absolute", right: 0, top: 0, fontSize: "0.8rem", color: "var(--primary)", fontWeight: 700 }}>Forgot?</Link>
						<InputField 
							label="Password" 
							name="password" 
							type="password" 
							value={form.password} 
							onChange={handleChange} 
							placeholder="one23four" 
							error={errors.password} 
							required 
						/>
					</div>

					<div className={styles.formFooter} style={{marginTop: '10px'}}>
						<Button type="submit" loading={authLoading}>
							SIGN IN
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default Login;
