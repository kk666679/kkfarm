import { httpBatchLink, loggerLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getBaseUrl } from './utils';
import type { AppRouter } from './router';
import { ReactNode, createElement } from 'react';

export const trpc = createTRPCReact<AppRouter>() as any;
export const queryClient = new QueryClient();
export const trpcClient = trpc.createClient({
  links: [
    loggerLink({
      enabled: opts =>
        import.meta.env.DEV || (opts.direction === 'down' && opts.result instanceof Error),
    }),
    httpBatchLink({ url: `${getBaseUrl()}/trpc` }),
  ],
});

export function TrpcProvider({ children }: { children: ReactNode }) {
  return createElement(
    QueryClientProvider,
    { client: queryClient },
    createElement(trpc.Provider, { client: trpcClient, queryClient: queryClient, children })
  );
}

export { httpBatchLink, loggerLink, getBaseUrl };
export type { AppRouter };
