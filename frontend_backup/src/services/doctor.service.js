import api from './api';

export const getAllDoctors = async () => {
  const response = await api.get('/api/doctors');
  return response.data;
};

export const getDoctorById = async (id) => {
  const response = await api.get(`/api/doctors/${id}`);
  return response.data;
};

export const getMyDoctorProfile = async () => {
  const response = await api.get('/api/doctors/profile/me');
  return response.data;
};

export const upsertDoctorProfile = async (payload) => {
  const response = await api.post('/api/doctors/profile', payload);
  return response.data;
};

export const updateDoctorProfile = async (payload) => {
  const response = await api.put('/api/doctors/profile', payload);
  return response.data;
};

export const deleteDoctorProfile = async (id) => {
  const response = await api.delete(`/api/doctors/profile/${id}`);
  return response.data;
};

export default {
  getAllDoctors,
  getDoctorById,
  getMyDoctorProfile,
  upsertDoctorProfile,
  updateDoctorProfile,
  deleteDoctorProfile,
};
