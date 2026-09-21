import { z } from 'zod';


export const DeviceStatusSchema = z.enum([
  'offline',
  'starting',
  'online',
  'busy',
  'error',
  'stopping',
]);
export const CreateDeviceBodySchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1 },
    provider: { type: 'string', minLength: 1 },
    serial: { type: 'string' },
    androidVersion: { type: 'string' },
    apiLevel: { type: 'integer' },
    containerId: { type: 'string' },
    adbHost: { type: 'string' },
    adbPort: { type: 'integer' },
  },
  required: ['name', 'provider'],
  additionalProperties: false,
} as const;

export const DeviceIdParamsSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
  },
  required: ['id'],
  additionalProperties: false,
} as const;

export const EmptyBodySchema = {
  type: 'object',
  properties: {},
  additionalProperties: false,
} as const;

export const AcquireDeviceBodySchema = {
  type: 'object',
  properties: {
    taskId: { type: 'string' },
  },
  required: ['taskId'],
  additionalProperties: false,
} as const;

export const ReleaseDeviceBodySchema = {
  type: 'object',
  properties: {
    taskId: { type: 'string' },
  },
  required: ['taskId'],
  additionalProperties: false,
} as const;

export const ShellCommandBodySchema = {
  type: 'object',
  properties: {
    command: { type: 'string', minLength: 1 },
  },
  required: ['command'],
  additionalProperties: false,
} as const;

export const DeviceLogsQuerySchema = {
  type: 'object',
  properties: {
    filter: { type: 'string' },
    maxLines: { type: 'integer' },
  },
  additionalProperties: false,
} as const;

export const PackageNameBodySchema = {
  type: 'object',
  properties: {
    packageName: { type: 'string', minLength: 1 },
  },
  required: ['packageName'],
  additionalProperties: false,
} as const;

export const ApkPathBodySchema = {
  type: 'object',
  properties: {
    apkPath: { type: 'string', minLength: 1 },
  },
  required: ['apkPath'],
  additionalProperties: false,
} as const;

export const TaskTypeSchema = z.enum([
  'shell',
  'tap',
  'swipe',
  'screenshot',
  'install_apk',
  'uninstall_apk',
  'launch_app',
  'clear_app_data',
  'wait',
  'sequence',
]);

export const CreateTaskBodySchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: [
        'shell',
        'tap',
        'swipe',
        'screenshot',
        'install_apk',
        'uninstall_apk',
        'launch_app',
        'clear_app_data',
        'wait',
        'sequence',
      ],
    },
    priority: { type: 'integer', default: 0 },
    payload: { type: 'object', additionalProperties: true, default: {} },
    deviceId: { type: 'string' },
  },
  required: ['type'],
  additionalProperties: false,
} as const;

export const TaskIdParamsSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
  },
  required: ['id'],
  additionalProperties: false,
} as const;

export const LoginBodySchema = {
  type: 'object',
  properties: {
    username: { type: 'string', minLength: 1 },
    password: { type: 'string', minLength: 1 },
  },
  required: ['username', 'password'],
  additionalProperties: false,
} as const;

export const CreateJobBodySchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1 },
    cron: { type: 'string', minLength: 1 },
    timezone: { type: 'string', default: 'UTC' },
    enabled: { type: 'boolean', default: true },
    taskTemplate: { type: 'object', additionalProperties: true, default: {} },
  },
  required: ['name', 'cron'],
  additionalProperties: false,
} as const;

export const JobIdParamsSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
  },
  required: ['id'],
  additionalProperties: false,
} as const;

export const EventsQuerySchema = {
  type: 'object',
  properties: {
    since: { type: 'string' },
  },
  additionalProperties: false,
} as const;

export const ErrorResponseSchema = {
  type: 'object',
  properties: {
    error: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        message: { type: 'string' },
      },
      required: ['code', 'message'],
    },
  },
  required: ['error'],
} as const;

export const SuccessResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
  },
  required: ['success'],
} as const;

export const AIChatBodySchema = {
  type: 'object',
  properties: {
    message: { type: 'string', minLength: 1, maxLength: 2000 },
    context: {
      type: 'object',
      properties: {
        devices: { type: 'array' },
        tasks: { type: 'array' },
        metrics: { type: 'object' },
      },
    },
  },
  required: ['message'],
  additionalProperties: false,
} as const;
