import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import InputField from "../../components/InputField";
import { registerUser } from "../../services/authService";
import { validateRegisterForm } from "../../utils/validators";
import styles from "./AuthPages.module.css";

const initialForm = {
	fullName: "",
	email: "",
	phone: "",
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
	const [agreed, setAgreed] = useState(false);
	const navigate = useNavigate();

	const handleChange = (e) => {
		let { name, value } = e.target;
		if (name === "phone") {
			value = value.replace(/\D/g, '').slice(0, 10);
		}
		setForm(prev => ({ ...prev, [name]: value }));
		setErrors(prev => ({ ...prev, [name]: "" }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const validationErrors = validateRegisterForm(form, role);
		if (!agreed) validationErrors.agree = "Please accept the terms.";
		
		setErrors(validationErrors);
		if (Object.keys(validationErrors).length > 0) {
			console.log("Validation Failed:", validationErrors);
			return;
		}

		setLoading(true);
		setAlert(null);
		try {
			await registerUser({ ...form, role });
			navigate("/verify-otp", { state: { email: form.email } });
		} catch (err) {
			setAlert({ type: "error", message: err?.response?.data?.message || "Registration failed. Please check your network." });
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={styles.page}>
			<div className={styles.registerLayout}>
				<div className={styles.brand}>MediSync</div>
				<h1 className={styles.title}>Create Account</h1>
				
				<div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: 'var(--radius-full)', marginBottom: '24px' }}>
					{["Patient", "Doctor"].map(r => (
						<button 
							key={r} 
							type="button" 
							style={{ 
								flex: 1, 
								padding: '8px', 
								borderRadius: 'var(--radius-full)', 
								border: 'none', 
								background: role === r.toLowerCase() ? 'white' : 'transparent',
								color: role === r.toLowerCase() ? 'var(--primary)' : 'var(--text-muted)',
								fontWeight: 700,
								cursor: 'pointer',
								boxShadow: role === r.toLowerCase() ? 'var(--shadow-sm)' : 'none'
							}} 
							onClick={() => {
								setRole(r.toLowerCase());
								setErrors({});
							}}
						>
							{r}
						</button>
					))}
				</div>

				{alert && <div className={`${styles.alert} ${styles.errorAlert}`}>{alert.message}</div>}

				<form className={styles.form} onSubmit={handleSubmit} noValidate>
					<div className={styles.fieldGrid}>
						<InputField label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} placeholder="e.g. Julian Pierce" error={errors.fullName} required />
						<InputField label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="julian@clinic.com" error={errors.email} required />
						<InputField label="Phone Number" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="10-digit number" error={errors.phone} required />
						
						{role === "patient" ? (
							<>
								<InputField label="Age" name="age" type="number" value={form.age} onChange={handleChange} placeholder="e.g. 25" error={errors.age} required />
								<div className={styles.field}>
									<label style={{fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block'}}>Gender</label>
									<select name="gender" value={form.gender} onChange={handleChange} style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: '#f8fafc' }}>
										<option value="">Select Gender</option>
										<option value="male">Male</option>
										<option value="female">Female</option>
										<option value="other">Other</option>
									</select>
									{errors.gender && <p style={{color: '#ef4444', fontSize: '0.8rem', marginTop: '4px'}}>{errors.gender}</p>}
								</div>
							</>
						) : (
							<>
								<InputField label="Specialization" name="specialization" value={form.specialization} onChange={handleChange} placeholder="e.g. Cardiology" error={errors.specialization} required />
								<InputField label="Experience (Years)" name="experience" type="number" value={form.experience} onChange={handleChange} placeholder="e.g. 10" error={errors.experience} required />
								<div style={{gridColumn: '1/-1'}}>
									<InputField label="Consultation Fee (₹)" name="consultationFee" type="number" value={form.consultationFee} onChange={handleChange} placeholder="e.g. 500" error={errors.consultationFee} required />
								</div>
							</>
						)}

						<InputField label="Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••••••" error={errors.password} required />
						<InputField label="Confirm Password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••••••" error={errors.confirmPassword} required />
					</div>

					<label className={styles.checkboxRow}>
						<input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
						<span>I accept the Terms and Privacy Policy.</span>
					</label>
					{errors.agree && <p className={styles.errorText}>{errors.agree}</p>}

					<div className={styles.formFooter}>
						<Button type="submit" loading={loading}>
							REGISTER NOW
						</Button>
						<p style={{textAlign: 'center', color: 'var(--text-muted)', marginTop: '16px'}}>
							Already have an account? <Link to="/login" style={{color: 'var(--primary)', fontWeight: 700}}>Sign In</Link>
						</p>
					</div>
				</form>
			</div>
		</div>
	);
};

export default Register;
