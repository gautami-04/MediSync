import api from "./api";

export const getMyPatientProfile = async () => {
	const response = await api.get("/api/patients/me");
	return response.data;
};

export const upsertMyPatientProfile = async (payload) => {
	const response = await api.put("/api/patients/me", payload);
	return response.data;
};
