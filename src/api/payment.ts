import { apiClient } from './client';
import { Transaction, Pagination } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const paymentApi = {
  createPayment: (amount: number) =>
    apiClient.post<{ clientSecret: string }>('/payment/create-payment', { amount }),

  transferMoney: (receivingId: number, amount: number, note?: string) =>
    apiClient.patch(
      '/payment/transfer-money',
      { receivingId, amount, note },
      { headers: { 'Idempotency-Key': uuidv4() } }
    ),

  getTransactionHistory: (page = 1, limit = 20) =>
    apiClient.get<{ history: Transaction[]; pagination: Pagination }>(
      `/payment/transactionhistory?page=${page}&limit=${limit}`
    ),

  getRecentTransactions: () =>
    apiClient.get<{ history: Transaction[] }>('/payment/recenttransactionhistory'),

  withdrawMoney: (amount: number) =>
    apiClient.patch(`/payment/withdraw/money/${amount}`),
};
