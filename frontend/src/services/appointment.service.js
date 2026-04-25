import api from "./api";

export const getMyAppointments = async () => {
	const response = await api.get("/api/appointments/my");
	return response.data;
};

export const cancelAppointment = async (appointmentId) => {
	const response = await api.put(`/api/appointments/cancel/${appointmentId}`);
	return response.data;
};

export const getAllDoctors = async () => {
	const response = await api.get("/api/doctors");
	return response.data;
};

export const bookAppointment = async (payload) => {
	const response = await api.post("/api/appointments/book", payload);
	return response.data;
};

export const getDoctorAppointments = async () => {
	const response = await api.get('/api/appointments/doctor');
	return response.data;
};

export const rescheduleAppointment = async (appointmentId, payload) => {
	const response = await api.put(`/api/appointments/${appointmentId}/reschedule`, payload);
	return response.data;
};
