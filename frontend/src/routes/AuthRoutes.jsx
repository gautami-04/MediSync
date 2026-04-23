import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import useAuth from "../hooks/useAuth";
import Home from "../pages/Home";
import OnboardingSurvey from "../pages/auth/OnboardingSurvey";
import Payments from "../pages/Payments";
import Settings from "../pages/Settings";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import OtpVerification from "../pages/auth/OtpVerification";

const AuthRoutes = () => {
	const { isAuthenticated } = useAuth();

  return (
    <Routes>
			<Route path="/" element={<Navigate to={isAuthenticated ? "/home" : "/register"} replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<OtpVerification />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<ProtectedRoute />}>
				<Route path="/onboarding-survey" element={<OnboardingSurvey />} />
        <Route path="/home" element={<Home />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

			<Route
				path="*"
				element={<Navigate to={isAuthenticated ? "/home" : "/register"} replace />}
			/>
    </Routes>
  );
};

export default AuthRoutes;