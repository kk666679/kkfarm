export function deviceToApiFormat(device) {
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
export function apiToDeviceFormat(data) {
  return {
    id: data.id,
    name: data.name,
    provider: data.provider,
    status: data.status,
    adbHost: data.adb_host,
    adbPort: data.adb_port,
    assignedTaskId: data.assigned_task_id,
    lastHeartbeat: data.last_heartbeat,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
export function taskToApiFormat(task) {
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
export function apiToTaskFormat(data) {
  return {
    id: data.id,
    type: data.type,
    status: data.status,
    deviceId: data.device_id,
    priority: data.priority,
    payload: data.payload,
    progress: data.progress,
    error: data.error,
    startedAt: data.started_at,
    completedAt: data.completed_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    retryCount: data.retry_count,
    maxRetries: data.max_retries,
    timeoutMs: data.timeout_ms,
  };
}
export function proxyToApiFormat(proxy) {
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
export function apiToProxyFormat(data) {
  return {
    id: data.id,
    url: data.url,
    type: data.type,
    credentials: data.credentials,
    country: data.country,
    city: data.city,
    rotationSchedule: data.rotation_schedule,
    isActive: data.is_active,
    failureCount: data.failure_count,
    lastUsedAt: data.last_used_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
//# sourceMappingURL=transformers.js.map
