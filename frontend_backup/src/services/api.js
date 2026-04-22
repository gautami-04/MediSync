import axios from "axios";

const api = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
	timeout: 15000,
	headers: {
		"Content-Type": "application/json",
	},
});

api.interceptors.request.use((config) => {
	const token = localStorage.getItem("medisync_token");

	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}

	return config;
});

// Global response handler: on 401 clear session and redirect to login
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error?.response?.status === 401) {
			try {
				localStorage.removeItem('medisync_token');
				localStorage.removeItem('medisync_user');
			} catch (_) {}
			if (typeof window !== 'undefined') {
				window.location.href = '/login';
			}
		}
		return Promise.reject(error);
	}
);

export default api;
