import type { McpToolDefinition } from './registry';
import type { McpToolContext } from '../types';
import type { IntegrationRegistry } from '@smartcloud/integration-hub';

export function registerIntegrationTools(
  registry: { register: (tool: McpToolDefinition) => void },
  hub?: { registry: IntegrationRegistry }
): void {
  registry.register({
    name: 'integration.list',
    description: 'List all registered integrations',
    inputSchema: { type: 'object', properties: {} },
    requiredScopes: ['integration:manage'],
    execute: async (_input, _ctx: McpToolContext) => {
      if (hub?.registry) {
        return { integrations: hub.registry.list() };
      }
      return { integrations: [] };
    },
  });

  registry.register({
    name: 'integration.get',
    description: 'Get an integration by ID',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
    requiredScopes: ['integration:manage'],
    execute: async (input, _ctx: McpToolContext) => {
      const { id } = input as { id: string };
      if (hub?.registry) {
        return { integration: hub.registry.get(id) };
      }
      return { integration: null };
    },
  });

  registry.register({
    name: 'integration.register',
    description: 'Register a new integration',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['slack', 'jira', 'gitlab', 'datadog'] },
        name: { type: 'string' },
        config: { type: 'object' },
      },
      required: ['type', 'name', 'config'],
    },
    requiredScopes: ['integration:manage'],
    execute: async (input, _ctx: McpToolContext) => {
      const data = input as Record<string, unknown>;
      if (hub?.registry) {
        hub.registry.register(data as never);
        return { success: true };
      }
      return { error: 'Integration registry not available' };
    },
  });
}
