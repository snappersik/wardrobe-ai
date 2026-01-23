import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // ✅ Для работы с cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// API методы
export const authAPI = {
  register: (data) => apiClient.post('/users/register', data),
  login: (data) => apiClient.post('/users/login', data),
  logout: () => apiClient.post('/users/logout'),
  getMe: () => apiClient.get('/users/me'),
};

export const clothingAPI = {
  uploadItem: (formData) => apiClient.post('/clothing/upload-item', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMyItems: () => apiClient.get('/clothing/my-items'),
};

export const outfitAPI = {
  create: (data) => apiClient.post('/outfits/create', data),
  getAll: () => apiClient.get('/outfits/my-outfits'),
  getDetail: (id) => apiClient.get(`/outfits/${id}`),
  delete: (id) => apiClient.delete(`/outfits/${id}`),
};

export default apiClient;
