/**
 * Public API type exports — consumed by internal dashboard (apps/web)
 *
 * This file is a minimal barrel export to avoid circular dependencies
 * and infinite type resolution loops. It exports ONLY types, no runtime code.
 */

// Re-export AppRouter type from the main router
import type { appRouter } from './trpc/router.ts';
export type AppRouter = typeof appRouter;

// Re-export Context type
export type { Context } from './trpc/context.ts';

