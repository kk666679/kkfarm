import type { DeviceTelemetrySample } from '../types';

export class RootCauseAnalyzer {
  analyze(
    samples: readonly DeviceTelemetrySample[]
  ): Array<{ deviceId: string; hypothesis: string; confidence: number; evidence: string[] }> {
    return samples.map(sample => {
      const evidence: string[] = [];
      if ((sample.cpuPercent ?? 0) > 90) evidence.push('high_cpu');
      if ((sample.memoryPercent ?? 0) > 90) evidence.push('high_memory');
      if ((sample.temperatureC ?? 0) > 70) evidence.push('thermal_pressure');
      return {
        deviceId: sample.deviceId,
        hypothesis: evidence.includes('thermal_pressure')
          ? 'Thermal pressure is degrading device performance'
          : evidence.includes('high_memory')
            ? 'Memory pressure is causing workload instability'
            : evidence.includes('high_cpu')
              ? 'CPU saturation is delaying workloads'
              : 'No material root cause detected',
        confidence: Math.min(0.95, evidence.length * 0.25),
        evidence,
      };
    });
  }
}
