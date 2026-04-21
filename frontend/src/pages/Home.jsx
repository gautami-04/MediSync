import { useMemo } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import useAuth from "../hooks/useAuth";
import styles from "./Home.module.css";

const Home = () => {
	const { user, logout } = useAuth();

	const roleLabel = useMemo(() => {
		if (!user?.role) {
			return "User";
		}

		const normalizedRole = String(user.role);
		return normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1);
	}, [user]);

	return (
		<div className={styles.page}>
			<div className={styles.card}>
				<h1>Welcome to MediSync</h1>
				<p>You are logged in as {roleLabel}.</p>

				<div className={styles.meta}>
					<span>Name: {user?.fullName || user?.name || "Not available"}</span>
					<span>Email: {user?.email || "Not available"}</span>
				</div>

				<div className={styles.actions}>
					<Link to="/verify-otp" className={styles.linkBtn}>
						OTP Verification Screen
					</Link>
					<Button variant="secondary" onClick={logout}>
						Logout
					</Button>
				</div>
			</div>
		</div>
	);
};

export default Home;
