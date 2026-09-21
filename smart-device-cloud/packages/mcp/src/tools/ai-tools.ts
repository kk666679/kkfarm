import type { McpToolDefinition } from './registry';
import type { McpToolContext } from '../types';
import type { DeviceAiEngine } from '@smartcloud/device-ai';

export function registerAiTools(
  registry: { register: (tool: McpToolDefinition) => void },
  engine?: DeviceAiEngine
): void {
  registry.register({
    name: 'ai.analyze',
    description: 'Run anomaly detection and analysis on devices',
    inputSchema: { type: 'object', properties: {} },
    requiredScopes: ['device:read'],
    execute: async (_input, _ctx: McpToolContext) => {
      if (engine) {
        const recommendations = await engine.analyze();
        return { recommendations };
      }
      return { recommendations: [] };
    },
  });

  registry.register({
    name: 'ai.recommendations',
    description: 'List all AI-generated recommendations',
    inputSchema: { type: 'object', properties: {} },
    requiredScopes: ['device:read'],
    execute: async (_input, _ctx: McpToolContext) => {
      if (engine) {
        return { recommendations: await engine.analyze() };
      }
      return { recommendations: [] };
    },
  });

  registry.register({
    name: 'ai.apply_recommendation',
    description: 'Apply an AI recommendation',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
    requiredScopes: ['device:write'],
    execute: async (input, _ctx: McpToolContext) => {
      const { id } = input as { id: string };
      if (engine) {
        const result = await engine.applyRecommendation(id);
        return result;
      }
      return { success: false, error: 'AI engine not available' };
    },
  });
}
