import type { McpToolDefinition } from './registry';
import type { McpToolContext } from '../types';
import type { WorkflowEngine, Workflow } from '@smartcloud/workflow-engine';
import type { Device } from '@smart-device-cloud/shared';

export function registerDeviceTools(
  registry: { register: (tool: McpToolDefinition) => void },
  engine?: {
    workflow: WorkflowEngine;
    deviceAgent?: unknown;
  }
): void {
  registry.register({
    name: 'device.discover',
    description: 'Discover all available devices',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    requiredScopes: ['device:read'],
    execute: async (_input, ctx: McpToolContext) => {
      if (engine?.workflow) {
        return { devices: [] as Device[] };
      }
      return { devices: [] as Device[] };
    },
  });

  registry.register({
    name: 'device.get',
    description: 'Get details about a specific device',
    inputSchema: {
      type: 'object',
      properties: {
        deviceId: { type: 'string' },
      },
      required: ['deviceId'],
    },
    requiredScopes: ['device:read'],
    execute: async (input, _ctx: McpToolContext) => {
      const { deviceId } = input as { deviceId: string };
      return { device: { id: deviceId, name: 'unknown', provider: 'unknown' } as Partial<Device> };
    },
  });

  registry.register({
    name: 'device.health',
    description: 'Check the health status of a device',
    inputSchema: {
      type: 'object',
      properties: {
        deviceId: { type: 'string' },
      },
      required: ['deviceId'],
    },
    requiredScopes: ['device:read'],
    execute: async (input, _ctx: McpToolContext) => {
      const { deviceId } = input as { deviceId: string };
      return { deviceId, healthy: true, details: {} };
    },
  });
}
