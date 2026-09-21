import { Device, Task, Proxy } from '..';

export function deviceToApiFormat(device: Device): Record<string, unknown> {
  return {
    id: device.id,
    name: device.name,
    provider: device.provider,
    status: device.status,
    adb_host: device.adbHost,
    adb_port: device.adbPort,
    assigned_task_id: device.assignedTaskId,
    last_heartbeat: device.lastHeartbeat,
    created_at: device.createdAt,
    updated_at: device.updatedAt,
  };
}

export function apiToDeviceFormat(data: Record<string, unknown>): Partial<Device> {
  return {
    id: data.id as string,
    name: data.name as string,
    provider: data.provider as string,
    status: data.status as Device['status'],
    adbHost: data.adb_host as string | undefined,
    adbPort: data.adb_port as number | undefined,
    assignedTaskId: data.assigned_task_id as string | undefined,
    lastHeartbeat: data.last_heartbeat as string | undefined,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };
}

export function taskToApiFormat(task: Task): Record<string, unknown> {
  return {
    id: task.id,
    type: task.type,
    status: task.status,
    device_id: task.deviceId,
    priority: task.priority,
    payload: task.payload,
    progress: task.progress,
    error: task.error,
    started_at: task.startedAt,
    completed_at: task.completedAt,
    created_at: task.createdAt,
    updated_at: task.updatedAt,
    retry_count: task.retryCount,
    max_retries: task.maxRetries,
    timeout_ms: task.timeoutMs,
  };
}

export function apiToTaskFormat(data: Record<string, unknown>): Partial<Task> {
  return {
    id: data.id as string,
    type: data.type as Task['type'],
    status: data.status as Task['status'],
    deviceId: data.device_id as string | undefined,
    priority: data.priority as number,
    payload: data.payload as Record<string, unknown>,
    progress: data.progress as number,
    error: data.error as string | undefined,
    startedAt: data.started_at as string | undefined,
    completedAt: data.completed_at as string | undefined,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    retryCount: data.retry_count as number | undefined,
    maxRetries: data.max_retries as number | undefined,
    timeoutMs: data.timeout_ms as number | undefined,
  };
}

export function proxyToApiFormat(proxy: Proxy): Record<string, unknown> {
  return {
    id: proxy.id,
    url: proxy.url,
    type: proxy.type,
    credentials: proxy.credentials,
    country: proxy.country,
    city: proxy.city,
    rotation_schedule: proxy.rotationSchedule,
    is_active: proxy.isActive,
    failure_count: proxy.failureCount,
    last_used_at: proxy.lastUsedAt,
    created_at: proxy.createdAt,
    updated_at: proxy.updatedAt,
  };
}

export function apiToProxyFormat(data: Record<string, unknown>): Partial<Proxy> {
  return {
    id: data.id as string,
    url: data.url as string,
    type: data.type as Proxy['type'],
    credentials: data.credentials as Proxy['credentials'],
    country: data.country as string | undefined,
    city: data.city as string | undefined,
    rotationSchedule: data.rotation_schedule as string | undefined,
    isActive: data.is_active as boolean,
    failureCount: data.failure_count as number,
    lastUsedAt: data.last_used_at as string | undefined,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };
}
