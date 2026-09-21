import { Device, Task, Proxy } from '..';
export declare function deviceToApiFormat(device: Device): Record<string, unknown>;
export declare function apiToDeviceFormat(data: Record<string, unknown>): Partial<Device>;
export declare function taskToApiFormat(task: Task): Record<string, unknown>;
export declare function apiToTaskFormat(data: Record<string, unknown>): Partial<Task>;
export declare function proxyToApiFormat(proxy: Proxy): Record<string, unknown>;
export declare function apiToProxyFormat(data: Record<string, unknown>): Partial<Proxy>;
//# sourceMappingURL=transformers.d.ts.map
