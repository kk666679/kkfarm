import { z } from 'zod';

const isoDate = z.string().datetime({ offset: true }).optional();

const nonEmptyString = (min = 1, max = 255) =>
  z
    .string()
    .min(min, { message: `Must be at least ${min} characters` })
    .max(max, { message: `Must be at most ${max} characters` });

const urlString = z.string().url({ message: 'Invalid URL format' });

export const DeviceSchema = z.object({
  id: nonEmptyString(1, 128),
  name: nonEmptyString(1, 255),
  provider: nonEmptyString(1, 255),
  serial: nonEmptyString(1, 255).optional(),
  androidVersion: z.string().optional(),
  apiLevel: z.number().int().min(1).max(34).optional(),
  status: z.enum(['offline', 'starting', 'online', 'busy', 'error', 'stopping']),
  containerId: z.string().optional(),
  adbHost: z.ipv4().optional(),
  adbPort: z.number().int().min(1).max(65535).optional(),
  assignedTaskId: z.string().optional(),
  lastHeartbeat: isoDate,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  capabilities: z.array(z.string()).optional(),
  ipAddress: z.ipv4().optional(),
});

export type DeviceInput = {
  id: string;
  name: string;
  provider: string;
  serial?: string;
  androidVersion?: string;
  apiLevel?: number;
  status: 'offline' | 'starting' | 'online' | 'busy' | 'error' | 'stopping';
  containerId?: string;
  adbHost?: string;
  adbPort?: number;
  assignedTaskId?: string;
  lastHeartbeat?: string;
  createdAt: string;
  updatedAt: string;
  capabilities?: string[];
  ipAddress?: string;
};

export type DeviceOutput = DeviceInput;

export const TaskSchema = z.object({
  id: nonEmptyString(1, 128),
  type: z.enum([
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
  ]),
  status: z.enum(['queued', 'running', 'completed', 'failed', 'cancelled']),
  deviceId: z.string().optional(),
  priority: z.number().int().min(0).max(100),
  payload: z.record(z.string(), z.unknown()),
  progress: z.number().min(0).max(100),
  error: z.string().optional(),
  startedAt: isoDate,
  completedAt: isoDate,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  retryCount: z.number().int().min(0).optional(),
  maxRetries: z.number().int().min(0).optional(),
  timeoutMs: z.number().int().min(0).optional(),
});

export type TaskInput = {
  id: string;
  type:
    | 'shell'
    | 'tap'
    | 'swipe'
    | 'screenshot'
    | 'install_apk'
    | 'uninstall_apk'
    | 'launch_app'
    | 'clear_app_data'
    | 'wait'
    | 'sequence';
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  deviceId?: string;
  priority: number;
  payload: Record<string, unknown>;
  progress: number;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  retryCount?: number;
  maxRetries?: number;
  timeoutMs?: number;
};

export type TaskOutput = TaskInput;

export const ProxySchema = z.object({
  id: nonEmptyString(1, 128),
  url: urlString,
  type: z.enum(['http', 'https', 'socks5', 'residential', 'datacenter']),
  credentials: z
    .object({
      username: z.string().optional(),
      password: z.string().optional(),
    })
    .optional(),
  country: z.string().length(2).optional(),
  city: z.string().optional(),
  rotationSchedule: z.string().optional(),
  isActive: z.boolean(),
  failureCount: z.number().int().min(0),
  lastUsedAt: isoDate,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ProxyInput = {
  id: string;
  url: string;
  type: 'http' | 'https' | 'socks5' | 'residential' | 'datacenter';
  credentials?: { username?: string; password?: string };
  country?: string;
  city?: string;
  rotationSchedule?: string;
  isActive: boolean;
  failureCount: number;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type ProxyOutput = ProxyInput;

export const ApplicationSchema = z.object({
  id: nonEmptyString(1, 128),
  packageName: z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/, {
    message: 'Invalid package name',
  }),
  versionName: nonEmptyString(1, 64),
  versionCode: z.number().int().min(1),
  minSdk: z.number().int().min(1).optional(),
  targetSdk: z.number().int().min(1).optional(),
  installStatus: z.enum(['pending', 'downloading', 'installing', 'installed', 'failed', 'removed']),
  apkUrl: urlString.optional(),
  apkHash: z
    .string()
    .regex(/^[a-f0-9]{64}$/i)
    .optional(),
  sizeBytes: z.number().int().min(0).optional(),
  installedAt: isoDate,
  updatedAt: z.string().datetime(),
  permissions: z.array(z.string()).optional(),
});

export type ApplicationInput = {
  id: string;
  packageName: string;
  versionName: string;
  versionCode: number;
  minSdk?: number;
  targetSdk?: number;
  installStatus: 'pending' | 'downloading' | 'installing' | 'installed' | 'failed' | 'removed';
  apkUrl?: string;
  apkHash?: string;
  sizeBytes?: number;
  installedAt?: string;
  updatedAt: string;
  permissions?: string[];
};

export type ApplicationOutput = ApplicationInput;

export const UserSchema = z.object({
  id: nonEmptyString(1, 128),
  email: z.string().email({ message: 'Invalid email address' }),
  name: nonEmptyString(1, 255),
  role: z.enum(['admin', 'operator', 'viewer']),
  permissions: z.array(z.string()),
  passwordHash: z.string().optional(),
  lastLoginAt: isoDate,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  isActive: z.boolean(),
});

export type UserInput = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'operator' | 'viewer';
  permissions: string[];
  passwordHash?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
};

export type UserOutput = UserInput;

export function validateDevice(
  data: unknown
): { success: true; data: DeviceOutput } | { success: false; error: Error } {
  const result = DeviceSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

export function validateTask(
  data: unknown
): { success: true; data: TaskOutput } | { success: false; error: Error } {
  const result = TaskSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

export function validateProxy(
  data: unknown
): { success: true; data: ProxyOutput } | { success: false; error: Error } {
  const result = ProxySchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

export function validateApplication(
  data: unknown
): { success: true; data: ApplicationOutput } | { success: false; error: Error } {
  const result = ApplicationSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

export function validateUser(
  data: unknown
): { success: true; data: UserOutput } | { success: false; error: Error } {
  const result = UserSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
