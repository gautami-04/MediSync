import api from './api';

export const getMyDoctorProfile = async () => {
  const response = await api.get('/api/doctors/profile/me');
  return response.data;
};

export const upsertDoctorProfile = async (payload) => {
  const response = await api.post('/api/doctors/profile', payload);
  return response.data;
};

export const getMyDoctorStats = async () => {
  const response = await api.get('/api/doctors/profile/me/stats');
  return response.data;
};
