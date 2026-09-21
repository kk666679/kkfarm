import type {
  DeviceProvider,
  DeviceInfo,
  HealthStatus,
  ShellResult,
  LogcatOptions,
} from '@smart-device-cloud/device-protocol';

export interface DeviceProviderDependencies {
  logger?: {
    info: (message: string, meta?: Record<string, unknown>) => void;
    warn: (message: string, meta?: Record<string, unknown>) => void;
    error: (message: string, meta?: Record<string, unknown>) => void;
  };
}

export abstract class BaseDeviceProvider implements DeviceProvider {
  abstract readonly name: string;
  protected logger?: DeviceProviderDependencies['logger'];

  constructor(deps?: DeviceProviderDependencies) {
    this.logger = deps?.logger;
  }

  protected log(message: string, meta?: Record<string, unknown>) {
    this.logger?.info(`[${this.name}] ${message}`, meta);
  }

  abstract discover(): Promise<DeviceInfo[]>;
  abstract start(deviceId: string): Promise<void>;
  abstract stop(deviceId: string): Promise<void>;
  abstract restart(deviceId: string): Promise<void>;
  abstract healthCheck(deviceId: string): Promise<HealthStatus>;
  abstract executeShell(deviceId: string, command: string): Promise<ShellResult>;
  abstract tap(deviceId: string, x: number, y: number): Promise<void>;
  abstract swipe(
    deviceId: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    durationMs?: number
  ): Promise<void>;
  abstract screenshot(deviceId: string): Promise<Buffer>;
  abstract logcat(deviceId: string, options?: LogcatOptions): AsyncIterable<string>;
  abstract installApk(deviceId: string, apkPath: string): Promise<void>;
  abstract uninstallApk(deviceId: string, packageName: string): Promise<void>;
  abstract launchApp(deviceId: string, packageName: string): Promise<void>;
  abstract clearAppData(deviceId: string, packageName: string): Promise<void>;
}
