/**
 * tRPC client exports
 * Re-export all tRPC utilities for use throughout the web app
 */

export { trpc } from './client.ts';
export { TRPCProvider } from './provider.tsx';
export { trpcClient, httpBatchLinkConfig } from './links.ts';
export { useApiHealth, useApiReady, useApiInfo } from './hooks.ts';

// Type exports
export type { AppRouter } from '@/types/api';
