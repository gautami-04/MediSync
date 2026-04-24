import api from "./api";

export const getAllDoctors = async () => {
	const response = await api.get("/api/doctors");
	return response.data;
};

export const getDoctorProfile = async () => {
	const response = await api.get("/api/doctors/profile/me");
	return response.data;
};
