import { apiClient } from './client';
import { User, MoneyRequest } from '@/types';

export const userApi = {
  getMe: () => apiClient.get<{ user: User }>('/users/user'),

  editUser: (data: Partial<User>) => apiClient.patch('/users/edituser', data),

  changePin: (oldpin: string, newpin: string) =>
    apiClient.patch('/users/changepin', { oldpin, newpin }),

  verifyPin: (pin: string) => apiClient.get(`/users/verify-pin/${pin}`),

  // Money requests
  getRequests: () => apiClient.get<{ requests: MoneyRequest[] }>('/users/requests'),

  getRequestsCreated: () =>
    apiClient.get<{ requests: MoneyRequest[] }>('/users/requests/created'),

  createRequest: (receiving_id: number, amount: number, note?: string) =>
    apiClient.post('/users/request/create', { receiving_id, amount, note }),

  acceptRequest: (id: string) => apiClient.patch(`/users/request/accept/${id}`),

  rejectRequest: (id: string) => apiClient.patch(`/users/request/reject/${id}`),

  // KYC
  submitKyc: (data: {
    idType: 'passport' | 'national_id' | 'drivers_license';
    idNumber: string;
    idFront?: string;
    idBack?: string;
    selfie?: string;
  }) => apiClient.post('/users/kyc/submit', data),

  getKycStatus: () => apiClient.get('/users/kyc/status'),
};
