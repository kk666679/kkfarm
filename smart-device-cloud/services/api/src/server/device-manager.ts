import { randomUUID } from 'crypto';
import { run, all, get } from '../db/database.ts';
import type {
  DeviceProvider,
  DeviceInfo,
  HealthStatus,
  ShellResult,
  LogcatOptions,
} from '@smart-device-cloud/device-protocol';
import type { Device, DeviceStatus } from '@smart-device-cloud/shared';

let realtime: { broadcast: (event: any) => void } | null = null;

export function setRealtimeService(service: { broadcast: (event: any) => void } | null) {
  realtime = service;
}

function mapDeviceRow(row: any): Device {
  return {
    id: row.id,
    name: row.name,
    provider: row.provider,
    serial: row.serial,
    androidVersion: row.android_version,
    apiLevel: row.api_level,
    status: row.status as DeviceStatus,
    state: (row.state as Device['state']) ?? 'offline',
    containerId: row.container_id,
    adbHost: row.adb_host,
    adbPort: row.adb_port,
    assignedTaskId: row.assigned_task_id,
    lastHeartbeat: row.last_heartbeat,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class DeviceManager {
  private provider: DeviceProvider;
  private devices: Map<string, Device> = new Map();
  private assignments: Map<string, string> = new Map();

  constructor(provider: DeviceProvider) {
    this.provider = provider;
  }

  async init() {
    const infos = await this.provider.discover();
    for (const info of infos) {
      const device: Device = {
        id: info.id,
        name: info.serial ?? info.id,
        provider: this.provider.name,
        serial: info.serial,
        androidVersion: info.androidVersion,
        apiLevel: info.apiLevel,
        state: 'offline',
        status: 'offline',
        adbHost: info.adbHost,
        adbPort: info.adbPort,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.devices.set(device.id, device);
      run(
        `INSERT OR REPLACE INTO devices (id, name, provider, serial, android_version, api_level, status, adb_host, adb_port, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          device.id,
          device.name,
          device.provider,
          device.serial,
          device.androidVersion,
          device.apiLevel,
          device.status,
          device.adbHost,
          device.adbPort,
          device.createdAt,
          device.updatedAt,
        ]
      );
    }
  }

  getAll(): Device[] {
    return Array.from(this.devices.values());
  }

  getById(id: string): Device | undefined {
    return this.devices.get(id);
  }

  async create(data: Omit<Device, 'id' | 'createdAt' | 'updatedAt'>): Promise<Device> {
    const id = `device-${Date.now()}-${randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();
    const device: Device = {
      id,
      name: data.name,
      provider: data.provider,
      serial: data.serial,
      androidVersion: data.androidVersion,
      apiLevel: data.apiLevel,
      status: data.status ?? 'offline',
      state: (data.state as Device['state']) ?? 'offline',
      containerId: data.containerId,
      adbHost: data.adbHost,
      adbPort: data.adbPort,
      assignedTaskId: data.assignedTaskId,
      lastHeartbeat: data.lastHeartbeat,
      createdAt: now,
      updatedAt: now,
    };
    this.devices.set(id, device);
    run(
      `INSERT INTO devices (id, name, provider, serial, android_version, api_level, status, state, container_id, adb_host, adb_port, assigned_task_id, last_heartbeat, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        device.id,
        device.name,
        device.provider,
        device.serial,
        device.androidVersion,
        device.apiLevel,
        device.status,
        device.state,
        device.containerId,
        device.adbHost,
        device.adbPort,
        device.assignedTaskId,
        device.lastHeartbeat,
        device.createdAt,
        device.updatedAt,
      ]
    );
    realtime?.broadcast({ type: 'device.updated', device });
    return device;
  }

  async delete(id: string): Promise<boolean> {
    const existed = this.devices.has(id);
    this.devices.delete(id);
    run('DELETE FROM devices WHERE id = ?', [id]);
    if (existed) {
      realtime?.broadcast({ type: 'device.deleted', deviceId: id });
    }
    return existed;
  }

  async start(deviceId: string): Promise<void> {
    const device = this.devices.get(deviceId);
    if (!device) throw new Error('Device not found');
    await this.provider.start(deviceId);
    device.status = 'online';
    device.state = 'online';
    device.updatedAt = new Date().toISOString();
    this.devices.set(deviceId, device);
    run(`UPDATE devices SET status = ?, state = ?, updated_at = ? WHERE id = ?`, [
      device.status,
      device.state,
      device.updatedAt,
      deviceId,
    ]);
    realtime?.broadcast({ type: 'device.updated', device });
  }

  async stop(deviceId: string): Promise<void> {
    const device = this.devices.get(deviceId);
    if (!device) throw new Error('Device not found');
    await this.provider.stop(deviceId);
    device.status = 'offline';
    device.state = 'offline';
    device.updatedAt = new Date().toISOString();
    this.devices.set(deviceId, device);
    run(`UPDATE devices SET status = ?, state = ?, updated_at = ? WHERE id = ?`, [
      device.status,
      device.state,
      device.updatedAt,
      deviceId,
    ]);
    this.assignments.delete(deviceId);
    realtime?.broadcast({ type: 'device.updated', device });
  }

  async acquire(deviceId: string, taskId: string): Promise<void> {
    const device = this.devices.get(deviceId);
    if (!device) throw new Error('Device not found');
    if (this.assignments.has(deviceId)) {
      throw new Error('Device already assigned');
    }
    this.assignments.set(deviceId, taskId);
    device.assignedTaskId = taskId;
    device.updatedAt = new Date().toISOString();
    run(`UPDATE devices SET assigned_task_id = ?, updated_at = ? WHERE id = ?`, [
      taskId,
      device.updatedAt,
      deviceId,
    ]);
    realtime?.broadcast({ type: 'device.updated', device });
  }

  async release(deviceId: string, taskId: string): Promise<void> {
    const assignment = this.assignments.get(deviceId);
    if (assignment !== taskId) {
      return;
    }
    this.assignments.delete(deviceId);
    const device = this.devices.get(deviceId);
    if (device) {
      device.assignedTaskId = undefined;
      device.updatedAt = new Date().toISOString();
      run(`UPDATE devices SET assigned_task_id = NULL, updated_at = ? WHERE id = ?`, [
        device.updatedAt,
        deviceId,
      ]);
      realtime?.broadcast({ type: 'device.updated', device });
    }
  }

  async executeShell(deviceId: string, command: string): Promise<ShellResult> {
    return this.provider.executeShell(deviceId, command);
  }

  async tap(deviceId: string, x: number, y: number): Promise<void> {
    await this.provider.tap(deviceId, x, y);
  }

  async swipe(
    deviceId: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    durationMs?: number
  ): Promise<void> {
    await this.provider.swipe(deviceId, x1, y1, x2, y2, durationMs);
  }

  async screenshot(deviceId: string): Promise<Buffer> {
    return this.provider.screenshot(deviceId);
  }

  logcat(deviceId: string, options?: LogcatOptions): AsyncIterable<string> {
    return this.provider.logcat(deviceId, options);
  }

  async installApk(deviceId: string, apkPath: string): Promise<void> {
    await this.provider.installApk(deviceId, apkPath);
  }

  async uninstallApk(deviceId: string, packageName: string): Promise<void> {
    await this.provider.uninstallApk(deviceId, packageName);
  }

  async launchApp(deviceId: string, packageName: string): Promise<void> {
    await this.provider.launchApp(deviceId, packageName);
  }

  async clearAppData(deviceId: string, packageName: string): Promise<void> {
    await this.provider.clearAppData(deviceId, packageName);
  }

  async healthCheck(id: string): Promise<{ status: string }> {
    const device = this.devices.get(id);
    if (!device) {
      return { status: 'not_found' };
    }
    return { status: device.status };
  }
}
