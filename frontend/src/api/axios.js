import axios from 'axios';

const api = axios.create({
  baseURL: 'https://taskpilot-production-xxxx.up.railway.app/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('tp_token');
      localStorage.removeItem('tp_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
