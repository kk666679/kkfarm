import type { PerformanceSample } from '../types';

export interface ProfileResult {
  cpuPercentiles: { p50: number; p95: number; p99: number };
  memoryPercentiles: { p50: number; p95: number; p99: number };
  sampleCount: number;
}

function percentile(values: number[], percent: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percent / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)] ?? 0;
}

export class EmulatorProfiler {
  profile(samples: readonly PerformanceSample[]): ProfileResult {
    const cpu = samples.map(sample => sample.cpuPercent);
    const memory = samples.map(sample => sample.memoryPercent);
    return {
      cpuPercentiles: {
        p50: percentile(cpu, 50),
        p95: percentile(cpu, 95),
        p99: percentile(cpu, 99),
      },
      memoryPercentiles: {
        p50: percentile(memory, 50),
        p95: percentile(memory, 95),
        p99: percentile(memory, 99),
      },
      sampleCount: samples.length,
    };
  }
}
