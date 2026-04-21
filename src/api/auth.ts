import { apiClient } from './client';
import { AuthTokens } from '@/types';

export const authApi = {
  register: (data: {
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    phonenumber: string;
    country: string;
    dob?: string;
  }) => apiClient.post('/users/register', data),

  signIn: (data: { email: string; password: string; pin: string }) =>
    apiClient.post<AuthTokens & { token: string; refreshToken: string; user: string }>(
      '/users/signin',
      data
    ),

  signOut: (refreshToken: string) =>
    apiClient.post('/users/signout', { refreshToken }),

  refreshToken: (refreshToken: string) =>
    apiClient.post<{ token: string; refreshToken: string }>(
      '/users/token/refresh',
      { refreshToken }
    ),

  getOtp: (email: string) => apiClient.get(`/users/getotp/${email}`),

  verifyOtp: (email: string, otp: string) =>
    apiClient.get(`/users/verifyotp/${email}/${otp}`),

  resetPassword: (email: string, password: string) =>
    apiClient.patch('/users/reset-password', { email, password }),

  setPin: (email: string, pin: string) =>
    apiClient.patch(`/users/setpin/${email}`, { pin }),
};
