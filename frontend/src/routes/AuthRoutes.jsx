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
import BookAppointment from "../pages/patient/BookAppointment";
import PatientDashboard from "../pages/patient/Dashboard";
import MedicalRecords from "../pages/patient/MedicalRecords";
import AppointmentHistory from "../pages/patient/AppointmentHistory";
import DoctorSearch from "../pages/patient/DoctorSearch";
import Favorites from "../pages/patient/Favorites";
import AdminRegister from "../pages/admin/AdminRegister";
import AdminLogin from "../pages/admin/AdminLogin";
import RoleBasedDashboard from "../components/RoleBasedDashboard";
import Dashboard from "../pages/doctor/Dashboard";
import DoctorProfile from "../pages/doctor/DoctorProfile";
import DoctorAppointments from "../pages/doctor/DoctorAppointments";

const AuthRoutes = () => {
	const { isAuthenticated } = useAuth();

  return (
    <Routes>
			<Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin/portal/register" element={<AdminRegister />} />
      <Route path="/admin/portal/login" element={<AdminLogin />} />
      <Route path="/verify-otp" element={<OtpVerification />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<ProtectedRoute />}>
				<Route path="/onboarding-survey" element={<OnboardingSurvey />} />
        <Route path="/dashboard" element={<RoleBasedDashboard />} />
        <Route path="/medical-records" element={<MedicalRecords />} />
        <Route path="/appointment-history" element={<AppointmentHistory />} />
        <Route path="/find-doctors" element={<DoctorSearch />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/book-appointment" element={<BookAppointment />} />
        <Route path="/doctor/dashboard" element={<Dashboard />} />
        <Route path="/doctor/profile" element={<DoctorProfile />} />
        <Route path="/doctor/appointments" element={<DoctorAppointments />} />
      </Route>

			<Route
				path="*"
				element={<Navigate to={isAuthenticated ? "/dashboard" : "/register"} replace />}
			/>
    </Routes>
  );
};

export default AuthRoutes;