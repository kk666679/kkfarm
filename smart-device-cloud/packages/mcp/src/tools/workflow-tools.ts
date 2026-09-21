import type { McpToolDefinition } from './registry';
import type { McpToolContext } from '../types';
import type { WorkflowEngine } from '@smartcloud/workflow-engine';

export function registerWorkflowTools(
  registry: { register: (tool: McpToolDefinition) => void },
  engine?: WorkflowEngine
): void {
  registry.register({
    name: 'workflow.list',
    description: 'List all workflows',
    inputSchema: { type: 'object', properties: {} },
    requiredScopes: ['workflow:execute'],
    execute: async (_input, _ctx: McpToolContext) => {
      if (engine) {
        return { workflows: engine.list() };
      }
      return { workflows: [] };
    },
  });

  registry.register({
    name: 'workflow.get',
    description: 'Get a workflow by ID',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
    requiredScopes: ['workflow:execute'],
    execute: async (input, _ctx: McpToolContext) => {
      const { id } = input as { id: string };
      if (engine) {
        return { workflow: engine.get(id) };
      }
      return { workflow: null };
    },
  });

  registry.register({
    name: 'workflow.execute',
    description: 'Execute a workflow',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
    requiredScopes: ['workflow:execute'],
    execute: async (input, _ctx: McpToolContext) => {
      const { id } = input as { id: string };
      if (engine) {
        const result = await engine.execute(id);
        return { execution: result };
      }
      return { error: 'Workflow engine not available' };
    },
  });

  registry.register({
    name: 'workflow.create',
    description: 'Create a new workflow',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        steps: { type: 'array' },
        trigger: { type: 'object' },
      },
      required: ['name', 'steps', 'trigger'],
    },
    requiredScopes: ['workflow:execute'],
    execute: async (input, _ctx: McpToolContext) => {
      if (engine) {
        const data = input as Record<string, unknown>;
        const workflow = engine.create(data as never);
        return { workflow };
      }
      return { error: 'Workflow engine not available' };
    },
  });
}
