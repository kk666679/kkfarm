import { z } from 'zod';
import type { TaskCreationData } from '@/types';

const TaskConfigSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.string(),
  configuration: z
    .object({
      timeout: z.number().optional(),
      retryOnFailure: z.boolean().optional(),
      appTest: z
        .object({
          appPackage: z.string(),
          testSuite: z.string(),
          testCases: z.array(z.string()),
          parameters: z.record(z.any()).optional(),
        })
        .optional(),
      screenshot: z
        .object({
          appPackage: z.string(),
          screens: z.array(z.string()),
          resolution: z.string(),
          format: z.enum(['png', 'jpg']),
        })
        .optional(),
      uiAutomation: z
        .object({
          appPackage: z.string(),
          actions: z.array(
            z.object({
              type: z.enum(['tap', 'swipe', 'input', 'wait']),
              target: z.string(),
              value: z.string().optional(),
              duration: z.number().optional(),
            })
          ),
          assertions: z.array(
            z.object({
              type: z.enum(['exists', 'visible', 'text', 'enabled']),
              target: z.string(),
              expected: z.any(),
            })
          ),
        })
        .optional(),
      apiTest: z
        .object({
          baseUrl: z.string().url(),
          endpoints: z.array(
            z.object({
              method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
              path: z.string(),
              body: z.any().optional(),
              expectedStatus: z.number(),
              assertions: z.array(
                z.object({
                  field: z.string(),
                  operator: z.enum(['equals', 'contains', 'greaterThan', 'lessThan']),
                  expected: z.any(),
                })
              ),
            })
          ),
          headers: z.record(z.string()),
        })
        .optional(),
      performance: z
        .object({
          appPackage: z.string(),
          duration: z.number().min(1).max(3600),
          metrics: z.array(
            z.object({
              name: z.string(),
              threshold: z.number(),
              unit: z.string(),
            })
          ),
        })
        .optional(),
      deviceFarm: z
        .object({
          parallelism: z.number().min(1),
          devicePool: z.array(z.string()),
          taskDistribution: z.enum(['round-robin', 'load-based']),
        })
        .optional(),
    })
    .optional(),
});

export class TaskConfigParser {
  static parse(jsonString: string): TaskCreationData {
    try {
      const parsed = JSON.parse(jsonString);
      const validated = TaskConfigSchema.parse(parsed);
      return validated as TaskCreationData;
    } catch (error: any) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON: ${error.message}`);
      }
      if (error instanceof z.ZodError) {
        const issues = (error.issues || error.errors || []) as any[];
        const fieldErrors = issues
          .map((e: any) => `${(e.path || []).join('.')}: ${e.message}`)
          .join(', ');
        throw new Error(`Validation failed: ${fieldErrors}`);
      }
      throw error;
    }
  }

  static validate(config: any): { valid: boolean; errors: string[] } {
    try {
      TaskConfigSchema.parse(config);
      return { valid: true, errors: [] };
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const issues = (error.issues || error.errors || []) as any[];
        return {
          valid: false,
          errors: issues.map((e: any) => `${(e.path || []).join('.')}: ${e.message}`),
        };
      }
      return { valid: false, errors: [error.message] };
    }
  }
}

export default TaskConfigParser;
