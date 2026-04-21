export interface User {
  _id: string;
  email: string;
  firstname: string;
  lastname: string;
  phonenumber: string;
  picture: string;
  dob: string;
  country: string;
  address: string;
  receivingId: number;
  wallet: number;
  currency: string;
  active: boolean;
  kycStatus: 'unverified' | 'pending' | 'approved' | 'rejected';
  totaldeposit: number;
  totalwithdrawl: number;
  dailyTransferLimit: number;
  dailyTransferUsed: number;
}

export interface Transaction {
  _id: string;
  sender?: User;
  receiver?: User;
  amount: number;
  currency: string;
  status: 'Success' | 'Canceled' | 'Pending' | 'Refunded';
  type: 'transfer' | 'deposit' | 'withdrawal' | 'refund';
  note: string;
  flagged: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MoneyRequest {
  _id: string;
  requested_by: User;
  requested_from: User;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected';
  note: string;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface AuthTokens {
  token: string;
  refreshToken: string;
  userId: string;
}
