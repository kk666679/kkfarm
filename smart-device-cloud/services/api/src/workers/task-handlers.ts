import type { DeviceManager } from '../server/device-manager.ts';
import type { Task, TaskHandler } from '@smart-device-cloud/shared';

export function createTaskHandlers(deviceManager: unknown): Map<string, TaskHandler> {
  const handlers = new Map<string, TaskHandler>();

  handlers.set('shell', async task => {
    const { deviceId, command } = task.payload as { deviceId: string; command: string };
    if (!deviceId || !command) {
      throw new Error('shell task requires deviceId and command');
    }
    const result = await (deviceManager as any).executeShell(deviceId, command);
    return { success: result.exitCode === 0, output: result };
  });

  handlers.set('tap', async task => {
    const { x, y } = task.payload as { x: number; y: number };
    if (typeof x !== 'number' || typeof y !== 'number') {
      throw new Error('tap task requires x and y numbers');
    }
    const deviceId = task.deviceId as string;
    if (!deviceId) {
      throw new Error('tap task requires deviceId');
    }
    await (deviceManager as any).tap(deviceId, x, y);
    return { success: true, output: { x, y } };
  });

  handlers.set('swipe', async task => {
    const { x1, y1, x2, y2, durationMs } = task.payload as {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      durationMs?: number;
    };
    const deviceId = task.deviceId as string;
    if (!deviceId) {
      throw new Error('swipe task requires deviceId');
    }
    await (deviceManager as any).swipe(deviceId, x1, y1, x2, y2, durationMs);
    return { success: true, output: { x1, y1, x2, y2, durationMs } };
  });

  handlers.set('screenshot', async task => {
    const deviceId = task.deviceId as string;
    if (!deviceId) {
      throw new Error('screenshot task requires deviceId');
    }
    const { buffer } = await (deviceManager as any).screenshot(deviceId);
    return { success: true, output: { size: buffer.length, mimeType: 'image/png' } };
  });

  handlers.set('install_apk', async task => {
    const { apkPath } = task.payload as { apkPath: string };
    const deviceId = task.deviceId as string;
    if (!deviceId || !apkPath) {
      throw new Error('install_apk task requires deviceId and apkPath');
    }
    await (deviceManager as any).installApk(deviceId, apkPath);
    return { success: true, output: { apkPath } };
  });

  handlers.set('uninstall_apk', async task => {
    const { packageName } = task.payload as { packageName: string };
    const deviceId = task.deviceId as string;
    if (!deviceId || !packageName) {
      throw new Error('uninstall_apk task requires deviceId and packageName');
    }
    await (deviceManager as any).uninstallApk(deviceId, packageName);
    return { success: true, output: { packageName } };
  });

  handlers.set('launch_app', async task => {
    const { packageName } = task.payload as { packageName: string };
    const deviceId = task.deviceId as string;
    if (!deviceId || !packageName) {
      throw new Error('launch_app task requires deviceId and packageName');
    }
    await (deviceManager as any).launchApp(deviceId, packageName);
    return { success: true, output: { packageName } };
  });

  handlers.set('clear_app_data', async task => {
    const { packageName } = task.payload as { packageName: string };
    const deviceId = task.deviceId as string;
    if (!deviceId || !packageName) {
      throw new Error('clear_app_data task requires deviceId and packageName');
    }
    await (deviceManager as any).clearAppData(deviceId, packageName);
    return { success: true, output: { packageName } };
  });

  handlers.set('wait', async task => {
    const { milliseconds } = task.payload as { milliseconds: number };
    if (typeof milliseconds !== 'number' || milliseconds < 0) {
      throw new Error('wait task requires non-negative milliseconds');
    }
    await new Promise(resolve => setTimeout(resolve, milliseconds));
    return { success: true, output: { milliseconds } };
  });

  handlers.set('sequence', async (task, deviceManager) => {
    const steps = task.payload.steps as Array<Record<string, unknown>>;
    if (!Array.isArray(steps)) {
      throw new Error('sequence task requires steps array');
    }
    const results: unknown[] = [];
    for (const step of steps) {
      const handler = handlers.get(step.type as string);
      if (!handler) {
        throw new Error(`Unknown sequence step type: ${step.type}`);
      }
      const result = await handler({ ...task, payload: step }, deviceManager);
      results.push(result);
    }
    return { success: true, output: { steps: results.length, results } };
  });

  return handlers;
}
