import type { ScalingDecision, WorkloadSnapshot } from '../types';

export class ScalingEngine {
  decide(workloads: readonly WorkloadSnapshot[]): ScalingDecision[] {
    return workloads
      .filter(workload => workload.status === 'running')
      .map(workload => {
        const load = Math.max(
          workload.resourceUsage.cpuPercent,
          workload.resourceUsage.memoryPercent,
          workload.progressPercent
        );
        const recommendedCapacity = load > 85 ? 2 : load > 65 ? 1 : 0;
        return {
          deviceId: workload.deviceId ?? 'fleet',
          currentLoad: load,
          recommendedCapacity,
          costImpact: recommendedCapacity * 0.04,
          confidence: Math.min(0.99, 0.5 + load / 200),
          reasoning:
            recommendedCapacity > 0
              ? 'Add capacity to protect workflow latency'
              : 'Current capacity is sufficient',
        };
      });
  }
}
