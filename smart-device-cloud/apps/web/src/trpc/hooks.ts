/**
 * Custom React hooks for common tRPC patterns
 * Re-exports tRPC hooks with type safety
 */

import { trpc } from './client.ts';

/**
 * Example hook: Use API health check
 * Demonstrates how to use tRPC queries in components
 */
export function useApiHealth(): ReturnType<typeof trpc.health.ping.useQuery> {
  return trpc.health.ping.useQuery();
}

/**
 * Example hook: Check API readiness
 */
export function useApiReady(): ReturnType<typeof trpc.health.ready.useQuery> {
  return trpc.health.ready.useQuery();
}

/**
 * Example hook: Get API info
 */
export function useApiInfo(): ReturnType<typeof trpc.health.info.useQuery> {
  return trpc.health.info.useQuery();
}

/**
 * Re-export tRPC client for advanced usage
 */
export { trpc } from './client.ts';
