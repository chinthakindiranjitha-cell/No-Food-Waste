import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Enables sending and receiving HTTP-Only cookies across requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth Service functions
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Food Request Service functions
export const requestService = {
  createRequest: async (requestData) => {
    const response = await api.post('/requests', requestData);
    return response.data;
  },
  getAllRequests: async () => {
    const response = await api.get('/requests');
    return response.data;
  },
  getMyRequests: async () => {
    const response = await api.get('/requests/my');
    return response.data;
  },
};

export default api;
