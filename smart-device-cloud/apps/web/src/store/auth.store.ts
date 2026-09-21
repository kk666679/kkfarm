import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { authService, type AuthUser } from '@/services/auth.service';

export interface RegistrationInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  company?: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRegistering: boolean;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  error: string | null;

  setToken: (token: string | null) => void;
  setUser: (user: AuthUser | null) => void;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  register: (input: RegistrationInput) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

const getPersistedToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('auth_token');
};

const persistedToken = getPersistedToken();

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        token: persistedToken,
        user: null,
        isAuthenticated: false,
        isLoading: !!persistedToken,
        isRegistering: false,
        isLoggingIn: false,
        isLoggingOut: false,
        error: null,

        setToken: (token: string | null) => {
          set({ token, isAuthenticated: !!token && !!get().user });
        },

        setUser: (user: AuthUser | null) => {
          set({ user, isAuthenticated: !!get().token && !!user });
        },

        login: async (credentials: { username: string; password: string }) => {
          set({ isLoggingIn: true, error: null });
          try {
            const res = await authService.login(credentials.username, credentials.password);
            localStorage.setItem('auth_token', res.token);
            set({
              token: res.token,
              user: res.user,
              isAuthenticated: true,
              isLoggingIn: false,
            });
          } catch (err) {
            set({
              error: err instanceof Error ? err.message : 'Login failed',
              isLoggingIn: false,
              isAuthenticated: false,
            });
            throw err;
          }
        },

        register: async (input: RegistrationInput) => {
          set({ isRegistering: true, error: null });
          try {
            const res = await authService.register(input);
            set({
              user: res.user,
              isRegistering: false,
            });
          } catch (err) {
            set({
              error: err instanceof Error ? err.message : 'Registration failed',
              isRegistering: false,
            });
            throw err;
          }
        },

        logout: async () => {
          set({ isLoggingOut: true });
          try {
            await authService.logout();
          } catch {
            // ignore logout network errors — still clear local state
          }
          localStorage.removeItem('auth_token');
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoggingOut: false,
          });
        },

        checkAuth: async () => {
          const { token } = get();
          if (!token) {
            set({ isLoading: false });
            return;
          }
          set({ isLoading: true });
          try {
            const res = await authService.me();
            set({
              user: res.user,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch {
            localStorage.removeItem('auth_token');
            set({
              token: null,
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        },

        clearError: () => set({ error: null }),
      }),
      {
        name: 'auth-store',
        partialize: state => ({ token: state.token }),
        onRehydrateStorage: () => (state) => {
          // Restore localStorage consistency after rehydration and keep the app in
          // a loading state until the session check completes.
          if (state?.token) {
            localStorage.setItem('auth_token', state.token);
            state.isLoading = true;
            state.isAuthenticated = false;
          }
        },
      }
    )
  )
);

// Re-export types for consumers
export type { AuthUser };

/**
 * Convenience selector hook mirroring the previous `useAuth` API.
 * Prefer selecting individual fields to avoid unnecessary re-renders.
 */
export function useAuth<T = AuthState>(selector: (state: AuthState) => T = (s: AuthState) => s as T): T {
  return useAuthStore(selector);
}