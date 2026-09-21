import type {
  DeviceProvider,
  DeviceInfo,
  HealthStatus,
  ShellResult,
  LogcatOptions,
} from '@smart-device-cloud/device-protocol';

export class LocalDeviceProvider implements DeviceProvider {
  readonly name = 'local';

  async discover(): Promise<DeviceInfo[]> {
    return [];
  }

  async start(deviceId: string): Promise<void> {}

  async stop(deviceId: string): Promise<void> {}

  async restart(deviceId: string): Promise<void> {
    await this.stop(deviceId);
    await this.start(deviceId);
  }

  async healthCheck(deviceId: string): Promise<HealthStatus> {
    return { healthy: true, details: {} };
  }

  async executeShell(deviceId: string, command: string): Promise<ShellResult> {
    return { exitCode: 0, stdout: '', stderr: '' };
  }

  async tap(deviceId: string, x: number, y: number): Promise<void> {}

  async swipe(
    deviceId: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    durationMs?: number
  ): Promise<void> {}

  async screenshot(deviceId: string): Promise<Buffer> {
    return Buffer.from([]);
  }

  logcat(deviceId: string, options?: LogcatOptions): AsyncIterable<string> {
    return {
      [Symbol.asyncIterator](): AsyncIterator<string> {
        return {
          next(): Promise<IteratorResult<string>> {
            return Promise.resolve({ done: true, value: '' });
          },
          return(): Promise<IteratorResult<string>> {
            return Promise.resolve({ done: true, value: undefined });
          },
          throw(error?: unknown): Promise<IteratorResult<string>> {
            return Promise.resolve({ done: true, value: undefined });
          },
        };
      },
    };
  }

  async installApk(deviceId: string, apkPath: string): Promise<void> {}

  async uninstallApk(deviceId: string, packageName: string): Promise<void> {}

  async launchApp(deviceId: string, packageName: string): Promise<void> {}

  async clearAppData(deviceId: string, packageName: string): Promise<void> {}
}