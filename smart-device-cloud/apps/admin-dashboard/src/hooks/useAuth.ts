import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  user: { id: string; email: string; name: string; role: string } | null;
  token: string | null;
  login: (token: string, user: AuthState['user']) => void;
  logout: () => void;
  setUser: (user: AuthState['user']) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      isAuthenticated: false,
      user: null,
      token: null,

      login: (token, user) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('sdc-auth-token', token);
        }
        set({ isAuthenticated: true, token, user });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('sdc-auth-token');
        }
        set({ isAuthenticated: false, user: null, token: null });
      },

      setUser: user => set({ user }),
    }),
    { name: 'sdc-auth-storage' }
  )
);

export const useAuth = useAuthStore;
