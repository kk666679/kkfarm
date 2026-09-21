import type { DeviceTelemetrySample, WorkloadSnapshot } from '../types';

export class FleetPatternAnalyzer {
  analyze(
    samples: readonly DeviceTelemetrySample[],
    workloads: readonly WorkloadSnapshot[]
  ): { fleetHealth: number; hotspots: string[] } {
    const cpu =
      samples.reduce((sum, sample) => sum + (sample.cpuPercent ?? 0), 0) /
      Math.max(1, samples.length);
    const memory =
      samples.reduce((sum, sample) => sum + (sample.memoryPercent ?? 0), 0) /
      Math.max(1, samples.length);
    const failed = workloads.filter(workload => workload.status === 'failed').length;
    return {
      fleetHealth: Math.max(0, Math.min(100, 100 - Math.max(cpu, memory) * 0.6 - failed * 5)),
      hotspots: samples
        .filter(sample => (sample.cpuPercent ?? 0) > 85 || (sample.memoryPercent ?? 0) > 85)
        .map(sample => sample.deviceId),
    };
  }
}
