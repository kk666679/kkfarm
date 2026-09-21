import { Device } from '../models/device';
import { Task } from '../models/task';
import { Proxy } from '../models/proxy';
import { Application } from '../models/application';
import { User } from '../models/user';

export function isDevice(value: unknown): value is Device {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.provider === 'string' &&
    typeof obj.status === 'string' &&
    Array.isArray(obj.capabilities ?? undefined) === (obj.capabilities !== undefined) &&
    (obj.adbPort === undefined || typeof obj.adbPort === 'number') &&
    (obj.apiLevel === undefined || typeof obj.apiLevel === 'number') &&
    (obj.ipAddress === undefined || typeof obj.ipAddress === 'string')
  );
}

export function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.status === 'string' &&
    typeof obj.priority === 'number' &&
    typeof obj.payload === 'object' &&
    typeof obj.progress === 'number' &&
    (obj.retryCount === undefined || typeof obj.retryCount === 'number') &&
    (obj.maxRetries === undefined || typeof obj.maxRetries === 'number') &&
    (obj.timeoutMs === undefined || typeof obj.timeoutMs === 'number')
  );
}

export function isProxy(value: unknown): value is Proxy {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.url === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.isActive === 'boolean' &&
    typeof obj.failureCount === 'number' &&
    (obj.credentials === undefined || typeof obj.credentials === 'object') &&
    (obj.country === undefined || typeof obj.country === 'string') &&
    (obj.city === undefined || typeof obj.city === 'string')
  );
}

export function isApplication(value: unknown): value is Application {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.packageName === 'string' &&
    typeof obj.versionName === 'string' &&
    typeof obj.versionCode === 'number' &&
    typeof obj.installStatus === 'string' &&
    typeof obj.updatedAt === 'string' &&
    (obj.minSdk === undefined || typeof obj.minSdk === 'number') &&
    (obj.targetSdk === undefined || typeof obj.targetSdk === 'number') &&
    (obj.sizeBytes === undefined || typeof obj.sizeBytes === 'number') &&
    (obj.permissions === undefined || Array.isArray(obj.permissions))
  );
}

export function isUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.role === 'string' &&
    Array.isArray(obj.permissions) &&
    typeof obj.isActive === 'boolean' &&
    typeof obj.createdAt === 'string' &&
    typeof obj.updatedAt === 'string'
  );
}
