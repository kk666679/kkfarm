import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores';

export function useAuth() {
  const { user, isAuthenticated, login, logout, error, clearError } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated on mount
    if (!isAuthenticated) {
      setIsLoading(true);
      // Simulate auth check
      const timer = setTimeout(() => setIsLoading(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    error,
    clearError,
  };
}
