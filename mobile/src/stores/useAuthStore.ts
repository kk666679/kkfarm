import { create } from 'zustand';
import { authService } from '@/services/AuthService';
import { storageService } from '@/services/StorageService';
import { useGlobalLoading } from './useGlobalLoading';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthActions {
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  hydrate: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  error: null,

  login: async (username: string, password: string) => {
    const { startLoading, stopLoading } = useGlobalLoading.getState();
    startLoading('auth-login');
    try {
      const user = await authService.login(username, password);
      const token = await authService.getToken();
      set({ user, token: token ?? null, isAuthenticated: true, error: null });
    } catch (error: any) {
      set({ error: error.message || 'Login failed', isAuthenticated: false });
      throw error;
    } finally {
      stopLoading('auth-login');
    }
  },

  logout: async () => {
    const { startLoading, stopLoading } = useGlobalLoading.getState();
    startLoading('auth-logout');
    try {
      await authService.logout();
      await storageService.remove('auth_token');
      set({ user: null, token: null, isAuthenticated: false, error: null });
    } finally {
      stopLoading('auth-logout');
    }
  },

  clearError: () => set({ error: null }),

  hydrate: async () => {
    try {
      const token = await storageService.get<string>('auth_token');
      if (token) {
        const user = await authService.getUser();
        if (user) {
          set({ user, token, isAuthenticated: true });
        }
      }
    } catch {
      set({ token: null, user: null, isAuthenticated: false });
    }
  },
}));
