import { all, get, run } from '../db/database.ts';
import type {
  FleetMetrics,
  HealthMetrics,
  RegionalMetrics,
  CloudRegion,
} from '@smart-device-cloud/shared';
import { telemetryService } from './telemetry.service.ts';

export class AnalyticsService {
  async getFleetMetrics(): Promise<FleetMetrics> {
    const devices = await all<any>('SELECT * FROM devices');
    const totalDevices = devices.length;
    const onlineDevices = devices.filter(d => d.state === 'online').length;
    const offlineDevices = devices.filter(d => d.state === 'offline').length;
    const degradedDevices = devices.filter(d => d.state === 'degraded').length;

    const avgCpu = devices.reduce((s, d) => s + (d.cpu_usage ?? 0), 0) / (totalDevices || 1);
    const avgMemory = devices.reduce((s, d) => s + (d.memory_usage ?? 0), 0) / (totalDevices || 1);
    const avgStorage =
      devices.reduce((s, d) => s + (d.storage_usage ?? 0), 0) / (totalDevices || 1);
    const avgBattery =
      devices.reduce((s, d) => s + (d.battery_level ?? 0), 0) / (totalDevices || 1);
    const avgLatency =
      devices.reduce((s, d) => s + (d.network_latency ?? 0), 0) / (totalDevices || 1);

    const fleetHealth =
      totalDevices > 0 ? ((onlineDevices + degradedDevices) / totalDevices) * 100 : 0;

    return {
      totalDevices,
      onlineDevices,
      offlineDevices,
      degradedDevices,
      activeSessions: onlineDevices,
      runningWorkloads: 0,
      completedWorkloads: 0,
      failedWorkloads: 0,
      avgCpuPercent: Math.round(avgCpu),
      avgMemoryPercent: Math.round(avgMemory),
      avgStoragePercent: Math.round(avgStorage),
      avgBattery: Math.round(avgBattery),
      avgNetworkLatency: Math.round(avgLatency),
      fleetHealthPercent: Math.round(fleetHealth),
      trends: { onlineDevices: 0, fleetHealth: 0, avgCpuPercent: 0 },
      timestamp: new Date().toISOString(),
    };
  }

  async getHealthMetrics(): Promise<HealthMetrics> {
    const devices = await all<any>('SELECT * FROM devices');
    const total = devices.length || 1;

    const cpuHealth = (devices.filter(d => (d.cpu_usage ?? 0) < 80).length / total) * 100;
    const memoryHealth = (devices.filter(d => (d.memory_usage ?? 0) < 85).length / total) * 100;

    const networkRows = await all<{ network_latency: number }>(
      'SELECT network_latency FROM devices WHERE state = $1',
      ['online']
    );
    const networkHealth =
      (networkRows.filter(r => r.network_latency < 200).length / (networkRows.length || 1)) * 100;

    const applicationHealth = 85;

    const executions = await all<{ status: string }>(
      `SELECT status FROM workload_executions WHERE created_at > NOW() - INTERVAL '30 days'`
    );
    const automationSuccessRate =
      executions.length > 0
        ? (executions.filter(e => e.status === 'completed').length / executions.length) * 100
        : 100;

    return {
      deviceAvailability:
        (devices.filter(d => d.state === 'online' || d.state === 'degraded').length / total) * 100,
      deviceAvailabilityPercent:
        (devices.filter(d => d.state === 'online' || d.state === 'degraded').length / total) * 100,
      cpuHealth,
      cpuHealthPercent: cpuHealth,
      memoryHealth,
      memoryHealthPercent: memoryHealth,
      networkHealth,
      networkHealthPercent: networkHealth,
      applicationHealth,
      applicationHealthPercent: applicationHealth,
      automationSuccessRate,
      trends: {
        deviceAvailability: 0,
        cpuHealth: 0,
        memoryHealth: 0,
        networkHealth: 0,
        applicationHealth: 0,
        automationSuccessRate: 0,
      },
    };
  }

  async getRegionalMetrics(): Promise<RegionalMetrics[]> {
    const regions: CloudRegion[] = ['singapore', 'tokyo', 'london', 'frankfurt', 'virginia'];
    return Promise.all(
      regions.map(async region => {
        const devices = await all<any>('SELECT * FROM devices WHERE cloud_region = $1', [region]);
        const deviceCount = devices.length;
        const onlineCount = devices.filter(d => d.state === 'online').length;
        const onlinePercent = deviceCount > 0 ? (onlineCount / deviceCount) * 100 : 0;
        const avgLatency =
          devices.reduce((s, d) => s + (d.network_latency ?? 0), 0) / (deviceCount || 1);
        const packetLoss = 0;

        return {
          region,
          deviceCount,
          onlineCount,
          onlinePercent,
          avgCpuPercent: 0,
          avgMemoryPercent: 0,
          avgLatency: Math.round(avgLatency),
          packetLoss,
          activeSessionCount: onlineCount,
          networkHealthScore: avgLatency < 150 && packetLoss < 1 ? 95 : 60,
          isHealthy: avgLatency < 150 && packetLoss < 1,
        };
      })
    );
  }

  async getCostMetrics(): Promise<any> {
    const devices = await all<any>('SELECT * FROM devices');
    const totalDevices = devices.length;
    const activeDeviceHours = totalDevices * 24;
    const computeCost = activeDeviceHours * 0.35;
    const storageCost = totalDevices * 10 * 0.08;
    const networkCost = totalDevices * 5 * 0.12;
    const automationCost = activeDeviceHours * 0.02;
    const totalCost = computeCost + storageCost + networkCost + automationCost;

    return {
      totalDevices,
      activeDeviceHours,
      computeCost,
      storageCost,
      networkCost,
      automationCost,
      totalCost,
      costPerDevice: totalDevices > 0 ? totalCost / totalDevices : 0,
      costPerWorkload: 0,
      previousPeriodCost: totalCost * 0.9,
      changePercent: 10,
      byRegion: {},
      byCategory: {},
    };
  }
}

export const analyticsService = new AnalyticsService();
