import type { PerformanceSample } from '../types';

export class ResourceMonitor {
  private readonly samples: PerformanceSample[] = [];

  record(sample: Omit<PerformanceSample, 'timestamp'>): PerformanceSample {
    const values = [sample.cpuPercent, sample.memoryPercent, sample.storagePercent];
    if (values.some(value => !Number.isFinite(value) || value < 0 || value > 100))
      throw new Error('Resource percentages must be between 0 and 100');
    const entry: PerformanceSample = { ...sample, timestamp: new Date().toISOString() };
    this.samples.push(entry);
    if (this.samples.length > 1000) this.samples.splice(0, this.samples.length - 1000);
    return { ...entry };
  }

  current(): PerformanceSample | undefined {
    const sample = this.samples[this.samples.length - 1];
    return sample ? { ...sample } : undefined;
  }

  history(since?: string): PerformanceSample[] {
    return this.samples
      .filter(sample => !since || sample.timestamp >= since)
      .map(sample => ({ ...sample }));
  }

  average(): Omit<PerformanceSample, 'timestamp'> {
    if (this.samples.length === 0) return { cpuPercent: 0, memoryPercent: 0, storagePercent: 0 };
    const totals = this.samples.reduce(
      (acc, sample) => ({
        cpuPercent: acc.cpuPercent + sample.cpuPercent,
        memoryPercent: acc.memoryPercent + sample.memoryPercent,
        storagePercent: acc.storagePercent + sample.storagePercent,
      }),
      { cpuPercent: 0, memoryPercent: 0, storagePercent: 0 }
    );
    const count = this.samples.length;
    return {
      cpuPercent: totals.cpuPercent / count,
      memoryPercent: totals.memoryPercent / count,
      storagePercent: totals.storagePercent / count,
    };
  }
}
