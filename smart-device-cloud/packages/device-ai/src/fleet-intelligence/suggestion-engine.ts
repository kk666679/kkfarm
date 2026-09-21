import type { DeviceTelemetrySample, WorkloadSnapshot } from '../types';

export class FleetSuggestionEngine {
  suggest(
    samples: readonly DeviceTelemetrySample[],
    workloads: readonly WorkloadSnapshot[]
  ): string[] {
    const suggestions: string[] = [];
    if (samples.some(sample => (sample.temperatureC ?? 0) > 70))
      suggestions.push('Inspect cooling and thermal throttling on hot devices');
    if (samples.some(sample => (sample.cpuPercent ?? 0) > 90))
      suggestions.push('Rebalance workloads away from saturated devices');
    if (workloads.some(workload => workload.status === 'failed'))
      suggestions.push('Review failed workload logs and device health');
    return suggestions;
  }
}
