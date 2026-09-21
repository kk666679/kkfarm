/**
 * tRPC and React Query provider for wrapping the app
 * Sets up the client, query cache, and other tRPC configuration
 */

import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLinkConfig } from './links.ts';
import { trpc } from './client.ts';

/**
 * Create QueryClient with default options
 */
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error: any) => {
          // Don't retry on 401/403
          if (error?.status === 401 || error?.status === 403) {
            return false;
          }
          // Retry up to 3 times for other errors
          return failureCount < 3;
        },
        refetchOnWindowFocus: true,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
      mutations: {
        retry: 1,
      },
    },
  });
}

interface TRPCProviderProps {
  children: ReactNode;
}

/**
 * TRPCProvider wraps the app with:
 * - QueryClientProvider (React Query)
 * - tRPC client
 * - HTTP batch link for batching multiple requests
 */
export function TRPCProvider({ children }: TRPCProviderProps) {
  const queryClient = useMemo(() => createQueryClient(), []);

  // tRPC client uses the httpBatchLinkConfig
  const trpcClient = useMemo(
    () =>
      trpc.createClient({
        links: [httpBatchLinkConfig],
      }),
    []
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
