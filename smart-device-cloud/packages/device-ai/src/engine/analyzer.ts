import type { DeviceTelemetrySample, WorkloadSnapshot } from '../types';

export class TelemetryAnalyzer {
  analyze(
    samples: readonly DeviceTelemetrySample[],
    workloads: readonly WorkloadSnapshot[]
  ): { averages: Record<string, number>; anomalies: string[] } {
    const numeric: Record<string, number[]> = {};
    for (const sample of samples) {
      for (const [key, value] of Object.entries(sample)) {
        if (
          key !== 'deviceId' &&
          key !== 'timestamp' &&
          typeof value === 'number' &&
          Number.isFinite(value)
        ) {
          (numeric[key] ??= []).push(value);
        }
      }
    }
    const averages = Object.fromEntries(
      Object.entries(numeric).map(([key, values]) => [
        key,
        values.reduce((sum, value) => sum + value, 0) / values.length,
      ])
    );
    const anomalies = Object.entries(averages)
      .filter(
        ([key, value]) =>
          (key === 'cpuPercent' && value > 90) ||
          (key === 'memoryPercent' && value > 90) ||
          (key === 'temperatureC' && value > 70)
      )
      .map(([key]) => key);
    return { averages, anomalies };
  }
}

export { TelemetryAnalyzer as DeviceAiAnalyzer };
