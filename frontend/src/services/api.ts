import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to dynamically attach jwt headers
api.interceptors.request.use(
  (config) => {
    const firebaseIdToken = typeof window !== 'undefined' ? localStorage.getItem('firebaseIdToken') : null;
    const accessToken = useAuthStore.getState().token;
    const requestUrl = config.url || '';
    const isFirebaseAuthRequest = requestUrl.includes('/auth/firebase-login');

    // Use Firebase ID token only for the auth exchange endpoint.
    // For protected app routes such as /profile/me, prefer the backend JWT.
    const token = isFirebaseAuthRequest ? firebaseIdToken || accessToken : accessToken || firebaseIdToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to intercept unauthenticated requests
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const res = await axios.post('/api/v1/auth/refresh-token', { refreshToken });
          const newAccessToken = res.data.accessToken;
          
          useAuthStore.getState().setAuth(useAuthStore.getState().user!, newAccessToken);
          
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        useAuthStore.getState().clearAuth();
      }
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default api;
