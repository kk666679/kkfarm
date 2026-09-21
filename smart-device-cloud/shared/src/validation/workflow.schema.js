import { z } from 'zod';
export const WorkflowStepSchema = z.object({
  id: z.string().uuid(),
  type: z.enum([
    'trigger',
    'provision_devices',
    'install_app',
    'launch_app',
    'execute_test',
    'collect_results',
    'generate_report',
    'release_devices',
  ]),
  config: z.record(z.string(), z.unknown()),
  dependencies: z.array(z.string()).optional(),
  nextSteps: z.array(z.string()).optional(),
  timeoutMs: z.number().int().positive().optional(),
  retryCount: z.number().int().nonnegative().optional(),
});
export const WorkflowSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  steps: z.array(WorkflowStepSchema),
  trigger: z.object({
    type: z.enum(['scheduled', 'manual', 'webhook', 'event-based']),
    cronExpression: z.string().optional(),
    webhookUrl: z.string().url().optional(),
    eventSource: z.string().optional(),
  }),
  status: z.enum(['active', 'paused', 'disabled', 'running', 'completed', 'failed']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  executionHistory: z
    .array(
      z.object({
        id: z.string().uuid(),
        workflowId: z.string().uuid(),
        deviceId: z.string().optional(),
        status: z.enum(['running', 'completed', 'failed', 'cancelled']),
        startedAt: z.string().datetime(),
        completedAt: z.string().datetime().optional(),
        error: z.string().optional(),
      })
    )
    .optional(),
});
export const WorkflowInputSchema = WorkflowSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
//# sourceMappingURL=workflow.schema.js.map
