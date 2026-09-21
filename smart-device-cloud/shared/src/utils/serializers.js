export function serializeDevice(device) {
  return JSON.stringify({
    id: device.id,
    name: device.name,
    provider: device.provider,
    status: device.status,
    capabilities: device.capabilities,
  });
}
export function deserializeDevice(json) {
  return JSON.parse(json);
}
export function serializeTask(task) {
  return JSON.stringify({
    id: task.id,
    type: task.type,
    status: task.status,
    priority: task.priority,
    progress: task.progress,
  });
}
export function deserializeTask(json) {
  return JSON.parse(json);
}
export function serializeProxy(proxy) {
  return JSON.stringify({
    id: proxy.id,
    url: proxy.url,
    type: proxy.type,
    isActive: proxy.isActive,
  });
}
export function deserializeProxy(json) {
  return JSON.parse(json);
}
export function serializeApplication(app) {
  return JSON.stringify({
    id: app.id,
    packageName: app.packageName,
    versionName: app.versionName,
    installStatus: app.installStatus,
  });
}
export function deserializeApplication(json) {
  return JSON.parse(json);
}
export function serializeUser(user) {
  return JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    permissions: user.permissions,
    isActive: user.isActive,
  });
}
export function deserializeUser(json) {
  return JSON.parse(json);
}
//# sourceMappingURL=serializers.js.map
