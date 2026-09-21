import type { McpToolDefinition } from './registry';
import type { McpToolContext } from '../types';
import type { BrowserManager } from '@smartcloud/multi-account-browser';

export function registerBrowserTools(
  registry: { register: (tool: McpToolDefinition) => void },
  manager?: BrowserManager
): void {
  registry.register({
    name: 'browser.create_profile',
    description: 'Create a new browser profile',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        proxy: { type: 'string' },
        userAgent: { type: 'string' },
      },
      required: ['name'],
    },
    requiredScopes: ['browser:manage'],
    execute: async (input, _ctx: McpToolContext) => {
      if (manager) {
        const data = input as Record<string, unknown>;
        const profile = manager.createProfile(data as never);
        return { profile };
      }
      return { error: 'Browser manager not available' };
    },
  });

  registry.register({
    name: 'browser.start_session',
    description: 'Start a browser session with a profile',
    inputSchema: {
      type: 'object',
      properties: {
        profileId: { type: 'string' },
      },
      required: ['profileId'],
    },
    requiredScopes: ['browser:manage'],
    execute: async (input, _ctx: McpToolContext) => {
      const { profileId } = input as { profileId: string };
      if (manager) {
        const session = manager.startSession(profileId);
        return { session };
      }
      return { error: 'Browser manager not available' };
    },
  });

  registry.register({
    name: 'browser.list_profiles',
    description: 'List all browser profiles',
    inputSchema: { type: 'object', properties: {} },
    requiredScopes: ['browser:manage'],
    execute: async (_input, _ctx: McpToolContext) => {
      if (manager) {
        return { profiles: manager.listProfiles() };
      }
      return { profiles: [] };
    },
  });
}
