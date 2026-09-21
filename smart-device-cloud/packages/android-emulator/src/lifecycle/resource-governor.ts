import type { ResourceAllocation, ResourceCapacity } from '../types';

export interface ResourceGovernorLimits extends ResourceCapacity {
  maxInstances: number;
}

export class ResourceGovernor {
  constructor(private readonly limits: ResourceGovernorLimits) {}

  validate(request: ResourceAllocation, instanceCount: number): void {
    if (
      request.cpuCores > this.limits.cpuCores ||
      request.ramMb > this.limits.ramMb ||
      request.storageMb > this.limits.storageMb
    ) {
      throw new Error('Emulator resource request exceeds governor limits');
    }
    if (instanceCount >= this.limits.maxInstances)
      throw new Error('Maximum emulator instance count exceeded');
  }

  resize(
    current: ResourceAllocation,
    next: ResourceAllocation,
    instanceCount: number
  ): ResourceAllocation {
    this.validate(next, instanceCount);
    if (
      next.cpuCores < current.cpuCores ||
      next.ramMb < current.ramMb ||
      next.storageMb < current.storageMb
    ) {
      throw new Error('Shrinking an active emulator allocation is not supported');
    }
    return { ...next };
  }
}
