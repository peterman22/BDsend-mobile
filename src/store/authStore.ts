import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { User, AuthTokens } from '@/types';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  userId: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setTokens: (tokens: AuthTokens) => Promise<void>;
  setUser: (user: User) => void;
  updateToken: (token: string) => void;
  signOut: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

const STORAGE_KEY = 'bdsend_auth';

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  refreshToken: null,
  userId: null,
  user: null,
  isAuthenticated: false,

  setTokens: async (tokens: AuthTokens) => {
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(tokens));
    set({
      token: tokens.token,
      refreshToken: tokens.refreshToken,
      userId: tokens.userId,
      isAuthenticated: true,
    });
  },

  setUser: (user: User) => set({ user }),

  updateToken: (token: string) => {
    const { refreshToken, userId } = get();
    if (refreshToken && userId) {
      SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify({ token, refreshToken, userId }));
    }
    set({ token });
  },

  signOut: async () => {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
    set({ token: null, refreshToken: null, userId: null, user: null, isAuthenticated: false });
  },

  loadFromStorage: async () => {
    try {
      const stored = await SecureStore.getItemAsync(STORAGE_KEY);
      if (stored) {
        const tokens: AuthTokens = JSON.parse(stored);
        set({
          token: tokens.token,
          refreshToken: tokens.refreshToken,
          userId: tokens.userId,
          isAuthenticated: true,
        });
      }
    } catch {
      // corrupt storage — reset
      await SecureStore.deleteItemAsync(STORAGE_KEY);
    }
  },
}));
