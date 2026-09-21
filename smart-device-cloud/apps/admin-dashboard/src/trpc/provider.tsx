import { type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { trpc, trpcClient, queryClient } from './client';

export function TrpcProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </trpc.Provider>
    </QueryClientProvider>
  );
}

export { trpcClient, queryClient, trpc };
