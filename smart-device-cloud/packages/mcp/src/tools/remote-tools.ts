import type { McpToolDefinition } from './registry';
import type { McpToolContext } from '../types';
import type { RemotePhoneManager } from '@smartcloud/remote-phone';

export function registerRemoteTools(
  registry: { register: (tool: McpToolDefinition) => void },
  manager?: RemotePhoneManager
): void {
  registry.register({
    name: 'remote.create_session',
    description: 'Create a remote phone session',
    inputSchema: {
      type: 'object',
      properties: {
        deviceId: { type: 'string' },
      },
      required: ['deviceId'],
    },
    requiredScopes: ['device:read'],
    execute: async (input, ctx: McpToolContext) => {
      const { deviceId } = input as { deviceId: string };
      if (manager) {
        const session = manager.createSession({
          deviceId,
          userId: ctx.userId ?? 'unknown',
          permissions: ['screen', 'input'],
        });
        return { session };
      }
      return { error: 'Remote phone manager not available' };
    },
  });

  registry.register({
    name: 'remote.list_sessions',
    description: 'List all remote sessions',
    inputSchema: { type: 'object', properties: {} },
    requiredScopes: ['device:read'],
    execute: async (_input, _ctx: McpToolContext) => {
      if (manager) {
        return { sessions: manager.listSessions() };
      }
      return { sessions: [] };
    },
  });

  registry.register({
    name: 'remote.close_session',
    description: 'Close a remote session',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string' },
      },
      required: ['sessionId'],
    },
    requiredScopes: ['device:read'],
    execute: async (input, _ctx: McpToolContext) => {
      const { sessionId } = input as { sessionId: string };
      if (manager) {
        manager.closeSession(sessionId);
        return { success: true };
      }
      return { error: 'Remote phone manager not available' };
    },
  });
}
