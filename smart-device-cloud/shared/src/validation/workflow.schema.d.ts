import { z } from 'zod';
export declare const WorkflowStepSchema: z.ZodObject<
  {
    id: z.ZodString;
    type: z.ZodEnum<{
      launch_app: 'launch_app';
      trigger: 'trigger';
      provision_devices: 'provision_devices';
      install_app: 'install_app';
      execute_test: 'execute_test';
      collect_results: 'collect_results';
      generate_report: 'generate_report';
      release_devices: 'release_devices';
    }>;
    config: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    dependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
    nextSteps: z.ZodOptional<z.ZodArray<z.ZodString>>;
    timeoutMs: z.ZodOptional<z.ZodNumber>;
    retryCount: z.ZodOptional<z.ZodNumber>;
  },
  z.core.$strip
>;
export declare const WorkflowSchema: z.ZodObject<
  {
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    steps: z.ZodArray<
      z.ZodObject<
        {
          id: z.ZodString;
          type: z.ZodEnum<{
            launch_app: 'launch_app';
            trigger: 'trigger';
            provision_devices: 'provision_devices';
            install_app: 'install_app';
            execute_test: 'execute_test';
            collect_results: 'collect_results';
            generate_report: 'generate_report';
            release_devices: 'release_devices';
          }>;
          config: z.ZodRecord<z.ZodString, z.ZodUnknown>;
          dependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
          nextSteps: z.ZodOptional<z.ZodArray<z.ZodString>>;
          timeoutMs: z.ZodOptional<z.ZodNumber>;
          retryCount: z.ZodOptional<z.ZodNumber>;
        },
        z.core.$strip
      >
    >;
    trigger: z.ZodObject<
      {
        type: z.ZodEnum<{
          scheduled: 'scheduled';
          manual: 'manual';
          webhook: 'webhook';
          'event-based': 'event-based';
        }>;
        cronExpression: z.ZodOptional<z.ZodString>;
        webhookUrl: z.ZodOptional<z.ZodString>;
        eventSource: z.ZodOptional<z.ZodString>;
      },
      z.core.$strip
    >;
    status: z.ZodEnum<{
      active: 'active';
      running: 'running';
      completed: 'completed';
      failed: 'failed';
      paused: 'paused';
      disabled: 'disabled';
    }>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    executionHistory: z.ZodOptional<
      z.ZodArray<
        z.ZodObject<
          {
            id: z.ZodString;
            workflowId: z.ZodString;
            deviceId: z.ZodOptional<z.ZodString>;
            status: z.ZodEnum<{
              running: 'running';
              completed: 'completed';
              failed: 'failed';
              cancelled: 'cancelled';
            }>;
            startedAt: z.ZodString;
            completedAt: z.ZodOptional<z.ZodString>;
            error: z.ZodOptional<z.ZodString>;
          },
          z.core.$strip
        >
      >
    >;
  },
  z.core.$strip
>;
export declare const WorkflowInputSchema: z.ZodObject<
  {
    trigger: z.ZodObject<
      {
        type: z.ZodEnum<{
          scheduled: 'scheduled';
          manual: 'manual';
          webhook: 'webhook';
          'event-based': 'event-based';
        }>;
        cronExpression: z.ZodOptional<z.ZodString>;
        webhookUrl: z.ZodOptional<z.ZodString>;
        eventSource: z.ZodOptional<z.ZodString>;
      },
      z.core.$strip
    >;
    status: z.ZodEnum<{
      active: 'active';
      running: 'running';
      completed: 'completed';
      failed: 'failed';
      paused: 'paused';
      disabled: 'disabled';
    }>;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    steps: z.ZodArray<
      z.ZodObject<
        {
          id: z.ZodString;
          type: z.ZodEnum<{
            launch_app: 'launch_app';
            trigger: 'trigger';
            provision_devices: 'provision_devices';
            install_app: 'install_app';
            execute_test: 'execute_test';
            collect_results: 'collect_results';
            generate_report: 'generate_report';
            release_devices: 'release_devices';
          }>;
          config: z.ZodRecord<z.ZodString, z.ZodUnknown>;
          dependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
          nextSteps: z.ZodOptional<z.ZodArray<z.ZodString>>;
          timeoutMs: z.ZodOptional<z.ZodNumber>;
          retryCount: z.ZodOptional<z.ZodNumber>;
        },
        z.core.$strip
      >
    >;
    executionHistory: z.ZodOptional<
      z.ZodArray<
        z.ZodObject<
          {
            id: z.ZodString;
            workflowId: z.ZodString;
            deviceId: z.ZodOptional<z.ZodString>;
            status: z.ZodEnum<{
              running: 'running';
              completed: 'completed';
              failed: 'failed';
              cancelled: 'cancelled';
            }>;
            startedAt: z.ZodString;
            completedAt: z.ZodOptional<z.ZodString>;
            error: z.ZodOptional<z.ZodString>;
          },
          z.core.$strip
        >
      >
    >;
  },
  z.core.$strip
>;
export type WorkflowInput = z.output<typeof WorkflowInputSchema>;
export type WorkflowOutput = z.output<typeof WorkflowSchema>;
//# sourceMappingURL=workflow.schema.d.ts.map
