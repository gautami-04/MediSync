import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import InputField from "../../components/InputField";
import useAuth from "../../hooks/useAuth";
import styles from "../auth/AuthPages.module.css";

const AdminLogin = () => {
	const [form, setForm] = useState({ email: "", password: "" });
	const [alert, setAlert] = useState(null);
	const navigate = useNavigate();
	const { login, authLoading } = useAuth();

	const handleChange = (e) => {
		setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setAlert(null);

		const result = await login(form);
		if (!result.success) {
			setAlert({ type: "error", message: result.message });
			return;
		}

		if (result.user.role !== 'admin') {
			setAlert({ type: "error", message: "This portal is for administrators only." });
			return;
		}

		navigate("/dashboard", { replace: true });
	};

	return (
		<div className={styles.page} style={{ backgroundColor: "#1a1a1a" }}>
			<div className={styles.loginLayout}>
				<div style={{ background: "white", padding: "40px", borderRadius: "24px", maxWidth: "400px", margin: "auto" }}>
					<div className={styles.brand} style={{ color: "#dc3545", marginBottom: "20px" }}>
						<span className={styles.brandIcon} style={{ background: "#dc3545" }}>
							<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
								<path d="M19 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.11 21 21 20.1 21 19V5C21 3.9 20.11 3 19 3ZM17 13H13V17H11V13H7V11H11V7H13V11H17V13Z" />
							</svg>
						</span>
						Admin Central
					</div>
					
					<h2 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>Administrator Login</h2>
					<p style={{ color: "#666", marginBottom: "24px" }}>Enter your credentials to access system controls.</p>

					{alert && <div className={styles.alert} style={{ background: "#fee2e2", color: "#b91c1c", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>{alert.message}</div>}

					<form className={styles.form} onSubmit={handleSubmit}>
						<InputField label="EMAIL ADDRESS" name="email" type="email" value={form.email} onChange={handleChange} required />
						<InputField label="PASSWORD" name="password" type="password" value={form.password} onChange={handleChange} required />
						
						<Button type="submit" loading={authLoading} style={{ background: "#dc3545" }}>
							Authorized Sign In
						</Button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default AdminLogin;
