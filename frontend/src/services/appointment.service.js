import api from "./api";

export const getMyAppointments = async () => {
	const response = await api.get("/api/appointments/my");
	return response.data;
};

export const cancelAppointment = async (appointmentId) => {
	const response = await api.put(`/api/appointments/cancel/${appointmentId}`);
	return response.data;
};
