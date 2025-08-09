import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  me: () => api.get('/auth/me'),
};

// Plans API
export const plansAPI = {
  getAll: () => api.get('/plans'),
  get: (id) => api.get(`/plans/${id}`),
  create: (planData) => api.post('/plans', planData),
  update: (id, planData) => api.put(`/plans/${id}`, planData),
  delete: (id) => api.delete(`/plans/${id}`),
  generateFromZ: () => api.post('/plans/generate-from-z'),
};

// Tasks API
export const tasksAPI = {
  getAll: (planId) => api.get(`/plans/${planId}/tasks`),
  create: (planId, taskData) => api.post(`/plans/${planId}/tasks`, taskData),
  update: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  delete: (id) => api.delete(`/tasks/${id}`),
};

// Comments API
export const commentsAPI = {
  getAll: (planId) => api.get(`/plans/${planId}/comments`),
  create: (commentData) => api.post('/comments', commentData),
};

// Statistics API
export const statisticsAPI = {
  get: () => api.get('/statistics'),
};

// API Tokens API
export const apiTokensAPI = {
  getAll: () => api.get('/api-tokens'),
  create: (tokenData) => api.post('/api-tokens', tokenData),
  delete: (id) => api.delete(`/api-tokens/${id}`),
};

// Sharing API
export const sharingAPI = {
  createLink: (planId, shareData) => api.post(`/plans/${planId}/share`, shareData),
  getSharedPlan: (shareToken) => api.get(`/shared/${shareToken}`),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;