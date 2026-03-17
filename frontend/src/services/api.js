import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

// Appointments
export const appointmentApi = {
  book: (data) => api.post('/appointments', data),
  confirm: (id) => api.patch(`/appointments/${id}/confirm`),
  complete: (id) => api.patch(`/appointments/${id}/complete`),
  cancel: (id) => api.patch(`/appointments/${id}/cancel`),
  myAppointments: () => api.get('/appointments/my'),
  doctorSchedule: () => api.get('/appointments/doctor/schedule'),
  all: (params) => api.get('/appointments', { params }),
};

// Doctors
export const doctorApi = {
  search: (query) => api.get('/doctors/search', { params: { query } }),
  byDepartment: (deptId) => api.get(`/doctors/department/${deptId}`),
  addSlot: (data) => api.post('/doctors/slots', data),
  getSlots: (doctorId, date) => api.get(`/doctors/${doctorId}/slots`, { params: { date } }),
  deleteSlot: (slotId) => api.delete(`/doctors/slots/${slotId}`),
};

// Departments
export const departmentApi = {
  getAll: () => api.get('/departments'),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
};

// Reports
export const reportApi = {
  dashboard: () => api.get('/reports/dashboard'),
  appointmentsPerDoctor: () => api.get('/reports/appointments-per-doctor'),
  revenuePerDepartment: () => api.get('/reports/revenue-per-department'),
};

export default api;
