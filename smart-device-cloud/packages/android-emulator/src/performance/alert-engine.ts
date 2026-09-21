import type { EmulatorAlert, PerformanceSample } from '../types';

export interface AlertThresholds {
  cpuPercent?: number;
  memoryPercent?: number;
  storagePercent?: number;
  temperatureC?: number;
}

export class AlertEngine {
  private readonly alerts: EmulatorAlert[] = [];

  evaluate(
    instanceId: string,
    sample: PerformanceSample,
    thresholds: AlertThresholds = {}
  ): EmulatorAlert[] {
    const checks: Array<{
      type: EmulatorAlert['type'];
      value: number;
      limit: number;
      message: string;
    }> = [
      {
        type: 'cpu',
        value: sample.cpuPercent,
        limit: thresholds.cpuPercent ?? 90,
        message: 'CPU usage is high',
      },
      {
        type: 'memory',
        value: sample.memoryPercent,
        limit: thresholds.memoryPercent ?? 90,
        message: 'Memory usage is high',
      },
      {
        type: 'storage',
        value: sample.storagePercent,
        limit: thresholds.storagePercent ?? 90,
        message: 'Storage usage is high',
      },
    ];
    if (sample.temperatureC !== undefined)
      checks.push({
        type: 'temperature',
        value: sample.temperatureC,
        limit: thresholds.temperatureC ?? 70,
        message: 'Emulator temperature is high',
      });
    const created = checks
      .filter(check => check.value >= check.limit)
      .map<EmulatorAlert>(check => ({
        id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        instanceId,
        severity: check.value >= check.limit + 10 ? 'critical' : 'warning',
        type: check.type,
        message: check.message,
        createdAt: new Date().toISOString(),
      }));
    this.alerts.push(...created);
    return created.map(alert => ({ ...alert }));
  }

  list(instanceId?: string): EmulatorAlert[] {
    return this.alerts
      .filter(alert => !instanceId || alert.instanceId === instanceId)
      .map(alert => ({ ...alert }));
  }
}
