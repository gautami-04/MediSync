import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import useAuth from "../hooks/useAuth";

// Auth pages
import ForgotPassword from "../pages/auth/ForgotPassword";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import OtpVerification from "../pages/auth/OtpVerification";

// Shared pages
import Payments from "../pages/Payments";
import Settings from "../pages/Settings";

// Patient pages
import PatientDashboard from "../pages/patient/Dashboard";
import PatientAppointments from "../pages/patient/BookAppointment";

// Doctor pages
import DoctorDashboard from "../pages/doctor/Dashboard";
import DoctorAppointments from "../pages/doctor/Appointments";

// Admin pages
import AdminDashboard from "../pages/admin/Dashboard";
import AdminAppointments from "../pages/admin/ManageUsers";

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
  return <PatientAppointments />;
};

const AuthRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<OtpVerification />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<RoleDashboard />} />
        <Route path="/appointments" element={<RoleAppointments />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AuthRoutes;