import api from "./api";

export const getMyProfile = async () => {
	const response = await api.get("/api/users/me");
	return response.data;
};

export const getUsers = async (filters = {}) => {
  try {
    const response = await api.get("/api/users", { params: filters });
    return response.data?.data || response.data;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw error;
  }
};
