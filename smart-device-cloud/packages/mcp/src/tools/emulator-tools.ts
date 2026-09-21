import type { McpToolDefinition } from './registry';
import type { McpToolContext } from '../types';
import {
  InMemoryEmulatorManager,
  type EmulatorManager,
  type AdbCommand,
  type AllowedAdbAction,
  type EmulatorProfile,
} from '@smartcloud/android-emulator';
import { COMMAND_ALLOWLIST } from '@smart-device-cloud/device-protocol';

export function registerEmulatorTools(
  registry: { register: (tool: McpToolDefinition) => void },
  manager?: EmulatorManager
): void {
  const emu = manager ?? new InMemoryEmulatorManager();

  registry.register({
    name: 'emulator.create_profile',
    description: 'Create a new emulator profile',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        androidVersion: { type: 'string' },
        apiLevel: { type: 'number' },
        ramMb: { type: 'number' },
        storageMb: { type: 'number' },
      },
      required: ['name', 'androidVersion', 'apiLevel'],
    },
    requiredScopes: ['emulator:manage'],
    execute: async (input, _ctx: McpToolContext) => {
      const data = input as Record<string, unknown>;
      const profile = emu.createProfile(data as Omit<EmulatorProfile, 'id'>);
      return { profile };
    },
  });

  registry.register({
    name: 'emulator.start',
    description: 'Start an emulator instance',
    inputSchema: {
      type: 'object',
      properties: {
        profileId: { type: 'string' },
      },
      required: ['profileId'],
    },
    requiredScopes: ['emulator:manage'],
    execute: async (input, _ctx: McpToolContext) => {
      const { profileId } = input as { profileId: string };
      const instance = await emu.start(profileId);
      return { instance };
    },
  });

  registry.register({
    name: 'emulator.stop',
    description: 'Stop an emulator instance',
    inputSchema: {
      type: 'object',
      properties: {
        instanceId: { type: 'string' },
      },
      required: ['instanceId'],
    },
    requiredScopes: ['emulator:manage'],
    execute: async (input, _ctx: McpToolContext) => {
      const { instanceId } = input as { instanceId: string };
      await emu.stop(instanceId);
      return { success: true };
    },
  });

  registry.register({
    name: 'emulator.execute_adb',
    description: 'Execute an allowlisted ADB command on an emulator',
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string' },
        args: { type: 'string' },
      },
      required: ['action', 'args'],
    },
    requiredScopes: ['emulator:manage'],
    execute: async (input, _ctx: McpToolContext) => {
      const { action, args } = input as { action: string; args: string };

      if (!Object.keys(COMMAND_ALLOWLIST).some(a => a === action)) {
        return { error: `Action not in allowlist: ${action}` };
      }

      const command: AdbCommand = {
        serial: action,
        action: action as AllowedAdbAction,
        args: [args],
      };
      const result = await emu.executeAdb(command);
      return { result };
    },
  });

  registry.register({
    name: 'emulator.list_profiles',
    description: 'List all emulator profiles',
    inputSchema: { type: 'object', properties: {} },
    requiredScopes: ['emulator:manage'],
    execute: async (_input, _ctx: McpToolContext) => {
      return { profiles: emu.listProfiles() };
    },
  });
}
