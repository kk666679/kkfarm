import { randomUUID } from 'crypto';
import { all, run, get } from '../db/database.ts';
import type { TelemetrySample, Device } from '@smart-device-cloud/shared';

export class TelemetryService {
  async ingest(deviceId: string, sample: Omit<TelemetrySample, 'deviceId'>): Promise<void> {
    await run(
      `INSERT INTO device_telemetry (device_id, timestamp, cpu, memory, storage, battery, temperature, network_latency, packet_loss)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        deviceId,
        new Date(sample.timestamp).toISOString(),
        sample.metrics.cpuPercent,
        sample.metrics.memoryPercent,
        sample.metrics.storagePercent,
        sample.metrics.batteryPercent,
        sample.metrics.temperatureCelsius,
        sample.metrics.networkLatencyMs,
        sample.metrics.networkPacketLossPercent,
      ]
    );

    const devices = await all<Device>('SELECT * FROM devices WHERE id = $1', [deviceId]);
    const device = devices[0];
    if (!device) return;

    const now = new Date();
    const lastHeartbeat = device.lastHeartbeat ? new Date(device.lastHeartbeat) : null;
    const heartbeatAgeMs = lastHeartbeat ? now.getTime() - lastHeartbeat.getTime() : Infinity;

    let newState: Device['state'] = device.state;
    if (heartbeatAgeMs > 300000) {
      newState = 'offline';
    } else if (heartbeatAgeMs > 60000) {
      newState = 'degraded';
    }

    const updates: Record<string, unknown> = {
      lastHeartbeat: new Date(sample.timestamp).toISOString(),
      batteryLevel: sample.metrics.batteryPercent,
      cpuUsage: sample.metrics.cpuPercent,
      memoryUsage: sample.metrics.memoryPercent,
      storageUsage: sample.metrics.storagePercent,
      temperature: sample.metrics.temperatureCelsius,
      networkLatency: sample.metrics.networkLatencyMs,
    };

    if (newState !== device.state) {
      updates.state = newState;
    }

    await run(
      `UPDATE devices SET last_heartbeat = $1, battery_level = $2, cpu_usage = $3, memory_usage = $4, storage_usage = $5, temperature = $6, network_latency = $7, state = $8, updated_at = $9 WHERE id = $10`,
      [
        new Date(sample.timestamp).toISOString(),
        sample.metrics.batteryPercent,
        sample.metrics.cpuPercent,
        sample.metrics.memoryPercent,
        sample.metrics.storagePercent,
        sample.metrics.temperatureCelsius,
        sample.metrics.networkLatencyMs,
        newState,
        now.toISOString(),
        deviceId,
      ]
    );
  }

  async getHistory(deviceId: string, limit = 1000): Promise<TelemetrySample[]> {
    const rows = await all<{
      device_id: string;
      timestamp: string;
      cpu: number;
      memory: number;
      storage: number;
      battery: number;
      temperature: number;
      network_latency: number;
      packet_loss: number;
    }>(`SELECT * FROM device_telemetry WHERE device_id = $1 ORDER BY timestamp DESC LIMIT $2`, [
      deviceId,
      limit,
    ]);

    return rows.map(r => ({
      deviceId: r.device_id,
      timestamp: new Date(r.timestamp).getTime(),
      metrics: {
        cpuPercent: r.cpu,
        memoryPercent: r.memory,
        storagePercent: r.storage,
        batteryPercent: r.battery,
        temperatureCelsius: r.temperature,
        networkLatencyMs: r.network_latency,
        networkPacketLossPercent: r.packet_loss,
      },
      receivedAt: new Date(r.timestamp).getTime(),
    }));
  }

  async getLatest(deviceId: string): Promise<TelemetrySample | null> {
    const row = await get<{
      device_id: string;
      timestamp: string;
      cpu: number;
      memory: number;
      storage: number;
      battery: number;
      temperature: number;
      network_latency: number;
      packet_loss: number;
    }>(`SELECT * FROM device_telemetry WHERE device_id = $1 ORDER BY timestamp DESC LIMIT 1`, [
      deviceId,
    ]);

    if (!row) return null;

    return {
      deviceId: row.device_id,
      timestamp: new Date(row.timestamp).getTime(),
      metrics: {
        cpuPercent: row.cpu,
        memoryPercent: row.memory,
        storagePercent: row.storage,
        batteryPercent: row.battery,
        temperatureCelsius: row.temperature,
        networkLatencyMs: row.network_latency,
        networkPacketLossPercent: row.packet_loss,
      },
      receivedAt: new Date(row.timestamp).getTime(),
    };
  }
}

export const telemetryService = new TelemetryService();
