import { z } from 'zod';
export declare const DeviceSchema: z.ZodObject<
  {
    id: z.ZodString;
    name: z.ZodString;
    provider: z.ZodString;
    serial: z.ZodOptional<z.ZodString>;
    androidVersion: z.ZodOptional<z.ZodString>;
    apiLevel: z.ZodOptional<z.ZodNumber>;
    status: z.ZodEnum<{
      offline: 'offline';
      starting: 'starting';
      online: 'online';
      busy: 'busy';
      error: 'error';
      stopping: 'stopping';
    }>;
    containerId: z.ZodOptional<z.ZodString>;
    adbHost: z.ZodOptional<z.ZodIPv4>;
    adbPort: z.ZodOptional<z.ZodNumber>;
    assignedTaskId: z.ZodOptional<z.ZodString>;
    lastHeartbeat: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    capabilities: z.ZodOptional<z.ZodArray<z.ZodString>>;
    ipAddress: z.ZodOptional<z.ZodIPv4>;
  },
  z.core.$strip
>;
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
export declare const TaskSchema: z.ZodObject<
  {
    id: z.ZodString;
    type: z.ZodEnum<{
      shell: 'shell';
      tap: 'tap';
      swipe: 'swipe';
      screenshot: 'screenshot';
      install_apk: 'install_apk';
      uninstall_apk: 'uninstall_apk';
      launch_app: 'launch_app';
      clear_app_data: 'clear_app_data';
      wait: 'wait';
      sequence: 'sequence';
    }>;
    status: z.ZodEnum<{
      queued: 'queued';
      running: 'running';
      completed: 'completed';
      failed: 'failed';
      cancelled: 'cancelled';
    }>;
    deviceId: z.ZodOptional<z.ZodString>;
    priority: z.ZodNumber;
    payload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    progress: z.ZodNumber;
    error: z.ZodOptional<z.ZodString>;
    startedAt: z.ZodOptional<z.ZodString>;
    completedAt: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    retryCount: z.ZodOptional<z.ZodNumber>;
    maxRetries: z.ZodOptional<z.ZodNumber>;
    timeoutMs: z.ZodOptional<z.ZodNumber>;
  },
  z.core.$strip
>;
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
export declare const ProxySchema: z.ZodObject<
  {
    id: z.ZodString;
    url: z.ZodString;
    type: z.ZodEnum<{
      http: 'http';
      https: 'https';
      socks5: 'socks5';
      residential: 'residential';
      datacenter: 'datacenter';
    }>;
    credentials: z.ZodOptional<
      z.ZodObject<
        {
          username: z.ZodOptional<z.ZodString>;
          password: z.ZodOptional<z.ZodString>;
        },
        z.core.$strip
      >
    >;
    country: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    rotationSchedule: z.ZodOptional<z.ZodString>;
    isActive: z.ZodBoolean;
    failureCount: z.ZodNumber;
    lastUsedAt: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
  },
  z.core.$strip
>;
export type ProxyInput = {
  id: string;
  url: string;
  type: 'http' | 'https' | 'socks5' | 'residential' | 'datacenter';
  credentials?: {
    username?: string;
    password?: string;
  };
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
export declare const ApplicationSchema: z.ZodObject<
  {
    id: z.ZodString;
    packageName: z.ZodString;
    versionName: z.ZodString;
    versionCode: z.ZodNumber;
    minSdk: z.ZodOptional<z.ZodNumber>;
    targetSdk: z.ZodOptional<z.ZodNumber>;
    installStatus: z.ZodEnum<{
      failed: 'failed';
      pending: 'pending';
      downloading: 'downloading';
      installing: 'installing';
      installed: 'installed';
      removed: 'removed';
    }>;
    apkUrl: z.ZodOptional<z.ZodString>;
    apkHash: z.ZodOptional<z.ZodString>;
    sizeBytes: z.ZodOptional<z.ZodNumber>;
    installedAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodString;
    permissions: z.ZodOptional<z.ZodArray<z.ZodString>>;
  },
  z.core.$strip
>;
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
export declare const UserSchema: z.ZodObject<
  {
    id: z.ZodString;
    email: z.ZodString;
    name: z.ZodString;
    role: z.ZodEnum<{
      admin: 'admin';
      operator: 'operator';
      viewer: 'viewer';
    }>;
    permissions: z.ZodArray<z.ZodString>;
    passwordHash: z.ZodOptional<z.ZodString>;
    lastLoginAt: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    isActive: z.ZodBoolean;
  },
  z.core.$strip
>;
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
export declare function validateDevice(data: unknown):
  | {
      success: true;
      data: DeviceOutput;
    }
  | {
      success: false;
      error: Error;
    };
export declare function validateTask(data: unknown):
  | {
      success: true;
      data: TaskOutput;
    }
  | {
      success: false;
      error: Error;
    };
export declare function validateProxy(data: unknown):
  | {
      success: true;
      data: ProxyOutput;
    }
  | {
      success: false;
      error: Error;
    };
export declare function validateApplication(data: unknown):
  | {
      success: true;
      data: ApplicationOutput;
    }
  | {
      success: false;
      error: Error;
    };
export declare function validateUser(data: unknown):
  | {
      success: true;
      data: UserOutput;
    }
  | {
      success: false;
      error: Error;
    };
//# sourceMappingURL=schemas.d.ts.map
