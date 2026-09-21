import { Device, Task, Proxy, Application, User } from '..';

export function serializeDevice(device: Device): string {
  return JSON.stringify({
    id: device.id,
    name: device.name,
    provider: device.provider,
    status: device.status,
    capabilities: device.capabilities,
  });
}

export function deserializeDevice(json: string): Partial<Device> {
  return JSON.parse(json) as Partial<Device>;
}

export function serializeTask(task: Task): string {
  return JSON.stringify({
    id: task.id,
    type: task.type,
    status: task.status,
    priority: task.priority,
    progress: task.progress,
  });
}

export function deserializeTask(json: string): Partial<Task> {
  return JSON.parse(json) as Partial<Task>;
}

export function serializeProxy(proxy: Proxy): string {
  return JSON.stringify({
    id: proxy.id,
    url: proxy.url,
    type: proxy.type,
    isActive: proxy.isActive,
  });
}

export function deserializeProxy(json: string): Partial<Proxy> {
  return JSON.parse(json) as Partial<Proxy>;
}

export function serializeApplication(app: Application): string {
  return JSON.stringify({
    id: app.id,
    packageName: app.packageName,
    versionName: app.versionName,
    installStatus: app.installStatus,
  });
}

export function deserializeApplication(json: string): Partial<Application> {
  return JSON.parse(json) as Partial<Application>;
}

export function serializeUser(user: User): string {
  return JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    permissions: user.permissions,
    isActive: user.isActive,
  });
}

export function deserializeUser(json: string): Partial<User> {
  return JSON.parse(json) as Partial<User>;
}
