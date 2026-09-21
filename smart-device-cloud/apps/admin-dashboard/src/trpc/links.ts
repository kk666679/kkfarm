import { httpBatchLink, loggerLink, type HTTPBatchLinkOptions } from '@trpc/client';
import { getBaseUrl } from './utils';

export function createClientLinks() {
  return [
    loggerLink({
      enabled: opts =>
        import.meta.env.DEV || (opts.direction === 'down' && opts.result instanceof Error),
    }),
    httpBatchLink({
      url: `${getBaseUrl()}/trpc`,
    }),
  ];
}

export type { HTTPBatchLinkOptions };
