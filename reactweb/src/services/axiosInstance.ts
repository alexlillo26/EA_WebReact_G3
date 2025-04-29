import axios from 'axios';
import { getToken, refreshAccessToken, logout } from './authService';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:9000/api',
});

axiosInstance.interceptors.request.use((config: any) => {
  const token = getToken();
  if (token) {
    console.log('Request authorized with token:', token); // Log de autorización
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.log('Request not authorized. No token found.'); // Log de no autorización
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    if (error.response?.status === 401 && error.response?.data?.message === 'Token expired') {
      try {
        const newToken = await refreshAccessToken();
        error.config.headers = error.config.headers || {};
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance.request(error.config);
      } catch (refreshError) {
        logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
