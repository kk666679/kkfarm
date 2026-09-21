const randomString = (length = 8) =>
  Math.random()
    .toString(36)
    .slice(2, 2 + length);
const deviceStatuses = ['offline', 'starting', 'online', 'busy', 'error', 'stopping'];
const deviceStates = [
  'provisioning',
  'ready',
  'online',
  'degraded',
  'offline',
  'maintenance',
  'quarantined',
  'retiring',
];
const taskStatuses = ['queued', 'running', 'completed', 'failed', 'cancelled'];
const taskTypes = [
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
];
const proxyTypes = ['http', 'https', 'socks5', 'residential', 'datacenter'];
const installStatuses = ['pending', 'downloading', 'installing', 'installed', 'failed', 'removed'];
const userRoles = ['admin', 'owner', 'administrator', 'operator', 'developer', 'viewer'];
export function mockDevice(overrides = {}) {
  return {
    id: `device-${randomString(12)}`,
    name: `Device-${randomString(6)}`,
    provider: 'docker-android',
    state: overrides.state ?? deviceStates[Math.floor(Math.random() * deviceStates.length)],
    status: overrides.status ?? deviceStatuses[Math.floor(Math.random() * deviceStatuses.length)],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}
export function mockTask(overrides = {}) {
  return {
    id: `task-${randomString(12)}`,
    type: taskTypes[Math.floor(Math.random() * taskTypes.length)],
    status: taskStatuses[Math.floor(Math.random() * taskStatuses.length)],
    priority: Math.floor(Math.random() * 100),
    payload: {},
    progress: Math.floor(Math.random() * 101),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}
export function mockProxy(overrides = {}) {
  return {
    id: `proxy-${randomString(12)}`,
    url: `http://${randomString(8)}.example.com:8080`,
    type: proxyTypes[Math.floor(Math.random() * proxyTypes.length)],
    isActive: Math.random() > 0.2,
    failureCount: Math.floor(Math.random() * 5),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}
export function mockApplication(overrides = {}) {
  return {
    id: `app-${randomString(12)}`,
    packageName: `com.example.${randomString(8)}`,
    versionName: `${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
    versionCode: Math.floor(Math.random() * 1000) + 1,
    installStatus: installStatuses[Math.floor(Math.random() * installStatuses.length)],
    healthStatus: 'unknown',
    updatedAt: new Date().toISOString(),
    installedDeviceCount: 0,
    healthyDeviceCount: 0,
    failedDeviceCount: 0,
    ...overrides,
  };
}
export function mockUser(overrides = {}) {
  return {
    id: `user-${randomString(12)}`,
    email: `${randomString(8)}@example.com`,
    name: `User ${randomString(6)}`,
    role: userRoles[Math.floor(Math.random() * userRoles.length)],
    permissions: ['read'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}
//# sourceMappingURL=mocks.js.map
