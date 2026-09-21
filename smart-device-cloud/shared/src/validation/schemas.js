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
export function validateDevice(data) {
  const result = DeviceSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
export function validateTask(data) {
  const result = TaskSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
export function validateProxy(data) {
  const result = ProxySchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
export function validateApplication(data) {
  const result = ApplicationSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
export function validateUser(data) {
  const result = UserSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
//# sourceMappingURL=schemas.js.map
