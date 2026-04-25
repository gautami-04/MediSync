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
import AdminDashboard from "../pages/admin/Dashboard";
import AdminAppointments from "../pages/admin/ManageUsers";

import RoleBasedDashboard from "../components/RoleBasedDashboard";
import DoctorDashboard from "../pages/doctor/Dashboard";
import DoctorProfile from "../pages/doctor/DoctorProfile";
import DoctorAppointments from "../pages/doctor/DoctorAppointments";

/* Renders the correct Dashboard based on user role */
const RoleDashboard = () => {
  const { user } = useAuth();
  const role = user?.role || "patient";

  if (role === "doctor") return <DoctorDashboard />;
  if (role === "admin") return <AdminDashboard />;
  return <PatientDashboard />;
};

/* Renders the correct Appointments page based on user role */
const RoleAppointments = () => {
  const { user } = useAuth();
  const role = user?.role || "patient";

  if (role === "doctor") return <DoctorAppointments />;
  if (role === "admin") return <AdminAppointments />;
  return <BookAppointment />;
};

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
        <Route path="/home" element={<RoleDashboard />} />
        <Route path="/dashboard" element={<RoleBasedDashboard />} />
        <Route path="/appointments" element={<RoleAppointments />} />
				<Route path="/onboarding-survey" element={<OnboardingSurvey />} />
        <Route path="/medical-records" element={<MedicalRecords />} />
        <Route path="/appointment-history" element={<AppointmentHistory />} />
        <Route path="/find-doctors" element={<DoctorSearch />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/book-appointment" element={<BookAppointment />} />
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
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