import type { DeviceCommandResult } from './commands/types';

export interface DeviceInfo {
  id: string;
  name: string;
  androidVersion?: string;
  apiLevel?: number;
  serial?: string;
  adbHost?: string;
  adbPort?: number;
}

export interface HealthStatus {
  healthy: boolean;
  details?: Record<string, unknown>;
}

export interface LogcatOptions {
  filter?: string;
  maxLines?: number;
  clear?: boolean;
}

export interface DeviceProvider {
  readonly name: string;
  discover(): Promise<DeviceInfo[]>;
  start(deviceId: string): Promise<void>;
  stop(deviceId: string): Promise<void>;
  restart(deviceId: string): Promise<void>;
  healthCheck(deviceId: string): Promise<HealthStatus>;
  executeShell(deviceId: string, command: string): Promise<DeviceCommandResult>;
  tap(deviceId: string, x: number, y: number): Promise<void>;
  swipe(
    deviceId: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    durationMs?: number
  ): Promise<void>;
  screenshot(deviceId: string): Promise<Buffer>;
  logcat(deviceId: string, options?: LogcatOptions): AsyncIterable<string>;
  installApk(deviceId: string, apkPath: string): Promise<void>;
  uninstallApk(deviceId: string, packageName: string): Promise<void>;
  launchApp(deviceId: string, packageName: string): Promise<void>;
  clearAppData(deviceId: string, packageName: string): Promise<void>;
}
