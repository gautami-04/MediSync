import api from './api';

export const bookAppointment = async (payload) => {
  const response = await api.post('/api/appointments/book', payload);
  return response.data;
};

export const getMyAppointments = async () => {
  const response = await api.get('/api/appointments/my');
  return response.data;
};

export const cancelAppointment = async (id) => {
  const response = await api.put(`/api/appointments/cancel/${id}`);
  return response.data;
};

export const getDoctorAppointments = async () => {
  const response = await api.get('/api/appointments/doctor');
  return response.data;
};

export default {
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  getDoctorAppointments,
};
