import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({ baseURL: BASE_URL });

// Adjunta el token del admin (si existe) a cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('horizontes_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el token expira o es inválido, se limpia la sesión
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('horizontes_admin_token');
    }
    return Promise.reject(error);
  }
);

export default api;
