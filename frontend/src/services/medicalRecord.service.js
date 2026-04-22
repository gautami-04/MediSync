import api from './api';

export const createMedicalRecord = async (payload) => {
  const response = await api.post('/api/medicalRecords', payload);
  return response.data;
};

export const getMyMedicalRecords = async () => {
  const response = await api.get('/api/medicalRecords/my');
  return response.data;
};

export const getDoctorPatientRecords = async () => {
  const response = await api.get('/api/medicalRecords/doctor');
  return response.data;
};

export const updateMedicalRecord = async (id, payload) => {
  const response = await api.patch(`/api/medicalRecords/${id}`, payload);
  return response.data;
};

export const deleteMedicalRecord = async (id) => {
  const response = await api.delete(`/api/medicalRecords/${id}`);
  return response.data;
};

export default {
  createMedicalRecord,
  getMyMedicalRecords,
  getDoctorPatientRecords,
  updateMedicalRecord,
  deleteMedicalRecord,
};
