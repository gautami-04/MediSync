import api from "./api";

export const getDoctors = async (filters = {}) => {
  try {
    const response = await api.get("/api/doctors", { params: filters });
    // Handle standard response structure where data is wrapped in a 'data' field or returned directly
    return response.data?.data || response.data;
  } catch (error) {
    // For development, if API fails, we could return mock data or throw
    console.error("Failed to fetch doctors:", error);
    throw error;
  }
};
