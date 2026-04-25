import api from "./api";

export const getAllDoctors = async () => {
	const response = await api.get("/api/doctors");
	return response.data;
};

export const getDoctorProfile = async () => {
	const response = await api.get("/api/doctors/profile/me");
	return response.data;
};

export const getMyDoctorProfile = getDoctorProfile;

export const upsertDoctorProfile = async (payload) => {
  const response = await api.post('/api/doctors/profile', payload);
  return response.data;
};

export const getMyDoctorStats = async () => {
  const response = await api.get('/api/doctors/profile/me/stats');
  return response.data;
};
