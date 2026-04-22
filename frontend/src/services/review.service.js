import api from './api';

export const addReview = async (payload) => {
  const response = await api.post('/api/reviews', payload);
  return response.data;
};

export const getDoctorReviews = async (doctorId) => {
  const response = await api.get(`/api/reviews/${doctorId}`);
  return response.data;
};

export default { addReview, getDoctorReviews };
