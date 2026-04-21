import axios from 'axios';
import { API_BASE_URL } from '@/constants/api';
import { useAuthStore } from '@/store/authStore';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Automatically refresh token on 401
let isRefreshing = false;
let queue: Array<(token: string) => void> = [];

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const { refreshToken, updateToken, signOut } = useAuthStore.getState();
      if (!refreshToken) {
        await signOut();
        return Promise.reject(error);
      }
      if (isRefreshing) {
        return new Promise((resolve) => {
          queue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(original));
          });
        });
      }
      isRefreshing = true;
      try {
        const { data } = await axios.post(`${API_BASE_URL}/users/token/refresh`, { refreshToken });
        updateToken(data.token);
        queue.forEach((cb) => cb(data.token));
        queue = [];
        original.headers.Authorization = `Bearer ${data.token}`;
        return apiClient(original);
      } catch {
        await signOut();
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
