/**
 * tRPC React client setup
 * Provides type-safe React hooks for tRPC queries and mutations
 */

import { createTRPCReact } from '@trpc/react-query';
import type { CreateTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/types/api';

/**
 * tRPC React client
 * Provides useQuery, useMutation, and other React hooks
 */
export const trpc: CreateTRPCReact<AppRouter, unknown> = createTRPCReact<AppRouter>();

/**
 * Type helpers for common query and mutation patterns
 */
export type TRPCInferProcedureInput<TRoute extends string> = any;
export type TRPCInferProcedureOutput<TRoute extends string> = any;
