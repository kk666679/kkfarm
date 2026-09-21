import type { Anomaly, DeviceTelemetrySample } from '../types';

export class AnomalyDetector {
  detect(sample: DeviceTelemetrySample): Anomaly[] {
    const checks: Array<{
      type: string;
      value: number | undefined;
      threshold: number;
      severity: Anomaly['severity'];
      description: string;
    }> = [
      {
        type: 'cpu_spike',
        value: sample.cpuPercent,
        threshold: 90,
        severity: 'warning',
        description: 'CPU usage exceeded the normal range',
      },
      {
        type: 'memory_pressure',
        value: sample.memoryPercent,
        threshold: 90,
        severity: 'warning',
        description: 'Memory usage exceeded the normal range',
      },
      {
        type: 'thermal_warning',
        value: sample.temperatureC,
        threshold: 70,
        severity: 'critical',
        description: 'Device temperature exceeded the safe range',
      },
      {
        type: 'heartbeat_delay',
        value: sample.heartbeatAgeMs,
        threshold: 30000,
        severity: 'critical',
        description: 'Device heartbeat is delayed',
      },
    ];
    return checks
      .filter(check => check.value !== undefined && (check.value as number) >= check.threshold)
      .map(check => ({
        id: `anomaly-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        deviceId: sample.deviceId,
        severity: check.severity,
        type: check.type,
        value: check.value as number,
        threshold: check.threshold,
        detectedAt: sample.timestamp,
        description: check.description,
      }));
  }
}
