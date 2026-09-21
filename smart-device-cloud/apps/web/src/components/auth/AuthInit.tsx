/**
 * AuthInit — Hydrates persisted auth state on app startup.
 *
 * Renders nothing. Mounting it triggers a one-time session check so that
 * `useAuthStore` reflects the real server-side session rather than the
 * persisted token alone.
 */

import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@/store/auth.store';

export function AuthInit({ children }: { children?: ReactNode }) {
  // `checkAuth` is a stable store action; calling it once on mount is safe.
  const checkAuth = useAuthStore(state => state.checkAuth);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  return <>{children ?? null}</>;
}