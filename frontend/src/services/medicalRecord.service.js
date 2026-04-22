import api from "./api";

export const getMyMedicalRecords = async () => {
	const response = await api.get("/api/medical-records/my");
	return response.data;
};
