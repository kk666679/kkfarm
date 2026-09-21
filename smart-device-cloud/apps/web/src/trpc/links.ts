/**
 * tRPC links configuration for web client
 * Sets up HTTP and WebSocket communication with API
 */

import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@/types/api';

/**
 * API base URL (configurable via environment)
 */
const getApiUrl = () => {
  const explicit = import.meta.env.VITE_API_URL;
  if (explicit) {
    return explicit.replace(/\/$/, '').replace(/\/api$/, '');
  }

  // In development, assume API runs on same host (vite proxy or port 3000)
  if (typeof window === 'undefined') {
    return 'http://localhost:3000';
  }

  const isDev = import.meta.env.DEV;
  const protocol = window.location.protocol;
  const host = window.location.host;

  if (isDev) {
    // During development, vite proxy handles /trpc -> localhost:3000/trpc
    return `${protocol}//${host}`;
  }

  // In production, assume API is on same domain
  return `${protocol}//${host}`;
};

/**
 * HTTP Batch Link with request batching support
 * Combines multiple procedure calls into a single HTTP request
 */
export const httpBatchLinkConfig = httpBatchLink({
  url: `${getApiUrl()}/trpc`,

  // Add auth header from localStorage
  headers: () => {
    const token = localStorage.getItem('auth_token');
    return token
      ? {
          authorization: `Bearer ${token}`,
        }
      : {};
  },

  // Handle server errors
  fetch: async (url, options) => {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      // Clear auth token and redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }

    return response;
  },
});

/**
 * Create tRPC client with HTTP batch link
 * Used in React context provider
 */
export const trpcClient = createTRPCClient<AppRouter>({
  links: [httpBatchLinkConfig],
});
