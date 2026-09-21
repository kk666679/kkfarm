import type { ZodType } from 'zod';
import type { AllowedDeviceAction } from './allowlist';
import { CommandSchemaMap } from './schema';
import type { DeviceCommandInput } from './schema';

export interface DeviceCommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export interface DeviceCommandRequest {
  action: AllowedDeviceAction;
  deviceId: string;
  params?: Record<string, unknown>;
}

export interface ParsedCommand {
  action: AllowedDeviceAction;
  deviceId: string;
  params: Record<string, unknown>;
  schema: ZodType;
}

const toString = (v: unknown): string => String(v ?? '');
const toNumber = (v: unknown): number => (typeof v === 'number' ? v : Number(v) || 0);

export function validateCommand(input: DeviceCommandInput): ParsedCommand | { error: string } {
  const {
    action,
    deviceId,
    params = {},
  } = input as {
    action: AllowedDeviceAction;
    deviceId: string;
    params?: Record<string, unknown>;
  };

  const schema = CommandSchemaMap[action];
  if (!schema) {
    return { error: `Unknown command action: ${action}` };
  }

  const payload = { action, deviceId, params };
  const result = schema.safeParse(payload);
  if (!result.success) {
    return { error: `Command validation failed: ${result.error.message}` };
  }

  return {
    action,
    deviceId,
    params,
    schema,
  };
}

export function buildAdbCommand(parsed: ParsedCommand): string[] {
  const { action, params } = parsed;

  switch (action) {
    case 'tap':
      return ['shell', 'input', 'tap', toString(params.x), toString(params.y)];
    case 'swipe':
      return [
        'shell',
        'input',
        'swipe',
        toString(params.x1),
        toString(params.y1),
        toString(params.x2),
        toString(params.y2),
        toString(params.durationMs ?? 100),
      ];
    case 'input_text':
      return ['shell', 'input', 'text', toString(params.text)];
    case 'key_event':
      return ['shell', 'input', 'keyevent', toString(params.keyCode)];
    case 'getprop':
      return params.key ? ['shell', 'getprop', toString(params.key)] : ['shell', 'getprop'];
    case 'list_packages':
      return ['shell', 'pm', 'list', 'packages'];
    case 'install_apk':
      return ['install', toString(params.apkPath)];
    case 'uninstall_apk':
      return ['uninstall', toString(params.packageName)];
    case 'launch_app':
      return params.activity
        ? [
            'shell',
            'am',
            'start',
            '-n',
            `${toString(params.packageName)}/${toString(params.activity)}`,
          ]
        : ['shell', 'am', 'start', '-n', toString(params.packageName)];
    case 'clear_app_data':
      return ['shell', 'pm', 'clear', toString(params.packageName)];
    case 'screenshot':
      return ['shell', 'screencap', '-p'];
    case 'logcat':
      return params.clear
        ? ['logcat', '-c']
        : [
            'logcat',
            ...(params.filter ? ['-s', toString(params.filter)] : []),
            ...(params.maxLines ? ['-t', toString(params.maxLines)] : []),
          ];
    case 'screen_record':
      return [
        'shell',
        'screenrecord',
        ...(params.durationMs
          ? ['--time-limit', toString(Math.floor(toNumber(params.durationMs) / 1000))]
          : []),
        toString(params.outputFile ?? '/sdcard/screenrecord.mp4'),
      ];
    case 'pull_file':
      return ['pull', toString(params.remotePath), toString(params.localPath)];
    case 'push_file':
      return ['push', toString(params.localPath), toString(params.remotePath)];
    case 'dump_heap':
      return params.packageName
        ? [
            'shell',
            'am',
            'dumpheap',
            toString(params.packageName),
            ...(params.outputFile ? ['-o', toString(params.outputFile)] : []),
          ]
        : ['shell', 'am', 'dumpheap'];
    case 'get_serial':
      return ['shell', 'getprop', 'ro.serial'];
    case 'get_state':
      return ['shell', 'getprop'];
    case 'start':
    case 'stop':
    case 'restart':
    case 'health_check':
      return [action];
    default:
      return [];
  }
}

export type { AllowedDeviceAction, DeviceCommandInput };
