import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
});

// Attach token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('taskflow_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth errors globally
API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('taskflow_token');
      localStorage.removeItem('taskflow_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
};

// Tasks
export const taskAPI = {
  getAll: (params) => API.get('/tasks', { params }),
  getById: (id) => API.get(`/tasks/${id}`),
  create: (data) => API.post('/tasks', data),
  update: (id, data) => API.put(`/tasks/${id}`, data),
  delete: (id) => API.delete(`/tasks/${id}`),
  getStats: () => API.get('/tasks/stats'),
};

export default API;
