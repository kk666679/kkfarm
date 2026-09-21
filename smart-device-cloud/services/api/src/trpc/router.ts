/**
 * tRPC Router — INTERNAL USE ONLY
 *
 * This router is consumed exclusively by trusted internal clients:
 *   - apps/web  (React dashboard, same-origin)
 *   - Internal service-to-service calls
 *
 * DO NOT expose these procedures to external consumers.
 * External/public APIs live under REST: /api/v1/*
 *
 * Convention:
 *   Internal (tRPC)  → /trpc/*
 *   External (REST)  → /api/v1/*
 */
import { randomUUID } from 'node:crypto';
import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { workflowService } from '../services/workflow.service.ts';
import type { Context } from './context.ts';
import { hasPermission, type UserRole } from '../middleware/auth.middleware.ts';

const t = initTRPC.context<Context>().create();

/**
 * Internal auth middleware — tRPC is trusted/internal only, but we still
 * enforce RBAC so that a misconfigured or hijacked session cannot escalate.
 */
function requirePermissionTRPC(permission: string) {
  return t.middleware(({ ctx, next }) => {
    const roles = (ctx.roles as string[]) || [];
    const allowed = roles.some(role => hasPermission(role as UserRole, permission));
    if (!allowed) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' });
    }
    return next({ ctx });
  });
}

// ─── Shared input schemas ────────────────────────────────────────────────────

const workflowIdInput = z.object({ workflowId: z.string().min(1) });

const workflowListInput = z.object({
  limit: z.number().int().min(1).max(100).default(50),
});

const workflowSaveInput = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  nodes: z.array(z.unknown()).optional(),
  edges: z.array(z.unknown()).optional(),
});

const workflowExecutionsInput = z.object({
  workflowId: z.string().min(1),
  limit: z.number().int().min(1).max(100).default(50),
});

// ─── Router ──────────────────────────────────────────────────────────────────

export const appRouter = t.router({
  /**
   * health — internal liveness/readiness checks.
   * External health endpoints live at GET /api/v1/health and GET /api/v1/ready.
   */
  health: t.router({
    ping: t.procedure.query(() => ({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    })),
    ready: t.procedure.query(() => ({ ready: true })),
    info: t.procedure.query(() => ({
      version: '0.1.0',
      environment: process.env.NODE_ENV ?? 'development',
    })),
  }),

  /**
   * workflow — internal workflow management for the dashboard UI.
   *
   * External consumers (third-party integrations, mobile, partner APIs) must
   * use the REST endpoints:
   *   GET    /api/v1/workflows
   *   GET    /api/v1/workflows/:id
   *   POST   /api/v1/workflows
   *   POST   /api/v1/workflows/:id/execute
   *   DELETE /api/v1/workflows/:id
   */
  workflow: t.router({
    list: t.procedure
      .use(requirePermissionTRPC('workflows:read'))
      .input(workflowListInput)
      .query(async ({ input }) => ({
        workflows: (await workflowService.getAll()).slice(0, input.limit),
      })),

    byId: t.procedure
      .use(requirePermissionTRPC('workflows:read'))
      .input(workflowIdInput)
      .query(async ({ input }) => {
        const workflow = await workflowService.getById(input.workflowId);
        if (!workflow) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Workflow not found' });
        }
        return workflow;
      }),

    run: t.procedure
      .use(requirePermissionTRPC('workflows:write'))
      .input(workflowIdInput)
      .mutation(async ({ input }) => {
        const workflow = await workflowService.getById(input.workflowId);
        if (!workflow) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Workflow not found' });
        }
        await workflowService.updateStatus(input.workflowId, 'running');
        return {
          workflowId: input.workflowId,
          executionId: `execution-${randomUUID()}`,
        };
      }),

    save: t.procedure
      .use(requirePermissionTRPC('workflows:write'))
      .input(workflowSaveInput)
      .mutation(async ({ input }) => {
        return workflowService.save(input);
      }),

    duplicate: t.procedure
      .use(requirePermissionTRPC('workflows:write'))
      .input(workflowIdInput)
      .mutation(async ({ input }) => {
        return workflowService.duplicate(input.workflowId);
      }),

    executions: t.procedure
      .use(requirePermissionTRPC('workflows:read'))
      .input(workflowExecutionsInput)
      .query(async ({ input }) => {
        const executions = await workflowService.getExecutions(input.workflowId, input.limit);
        return { executions };
      }),

    delete: t.procedure
      .use(requirePermissionTRPC('workflows:write'))
      .input(workflowIdInput)
      .mutation(async ({ input }) => {
        const workflow = await workflowService.getById(input.workflowId);
        if (!workflow) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Workflow not found' });
        }
        await workflowService.delete(input.workflowId);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
