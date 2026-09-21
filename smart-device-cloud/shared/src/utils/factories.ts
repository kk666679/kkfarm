import { Device } from '../models/device';
import { Task } from '../models/task';
import { Proxy } from '../models/proxy';
import { Application } from '../models/application';
import { User } from '../models/user';

export function createDevice(overrides: Partial<Device> = {}): Device {
  const now = new Date().toISOString();
  return {
    id: overrides.id ?? `device-${Date.now()}`,
    name: overrides.name ?? 'Unnamed Device',
    provider: overrides.provider ?? 'unknown',
    state: overrides.state ?? 'offline',
    status: overrides.status ?? 'offline',
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
    ...overrides,
  };
}

export function createTask(overrides: Partial<Task> = {}): Task {
  const now = new Date().toISOString();
  return {
    id: overrides.id ?? `task-${Date.now()}`,
    type: overrides.type ?? 'shell',
    status: overrides.status ?? 'queued',
    priority: overrides.priority ?? 0,
    payload: overrides.payload ?? {},
    progress: overrides.progress ?? 0,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
    ...overrides,
  };
}

export function createProxy(overrides: Partial<Proxy> = {}): Proxy {
  const now = new Date().toISOString();
  return {
    id: overrides.id ?? `proxy-${Date.now()}`,
    url: overrides.url ?? 'http://localhost:8080',
    type: overrides.type ?? 'http',
    isActive: overrides.isActive ?? true,
    failureCount: overrides.failureCount ?? 0,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
    ...overrides,
  };
}

export function createApplication(overrides: Partial<Application> = {}): Application {
  const now = new Date().toISOString();
  return {
    id: overrides.id ?? `app-${Date.now()}`,
    packageName: overrides.packageName ?? 'com.example.app',
    versionName: overrides.versionName ?? '1.0.0',
    versionCode: overrides.versionCode ?? 1,
    installStatus: overrides.installStatus ?? 'pending',
    healthStatus: overrides.healthStatus ?? 'unknown',
    updatedAt: overrides.updatedAt ?? now,
    installedDeviceCount: overrides.installedDeviceCount ?? 0,
    healthyDeviceCount: overrides.healthyDeviceCount ?? 0,
    failedDeviceCount: overrides.failedDeviceCount ?? 0,
    ...overrides,
  };
}

export function createUser(overrides: Partial<User> = {}): User {
  const now = new Date().toISOString();
  return {
    id: overrides.id ?? `user-${Date.now()}`,
    email: overrides.email ?? 'user@example.com',
    name: overrides.name ?? 'User',
    role: overrides.role ?? 'viewer',
    permissions: overrides.permissions ?? [],
    isActive: overrides.isActive ?? true,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
    ...overrides,
  };
}
