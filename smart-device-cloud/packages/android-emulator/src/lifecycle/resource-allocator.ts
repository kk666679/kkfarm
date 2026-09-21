import type { ResourceAllocation, ResourceCapacity } from '../types';

export class ResourceAllocator {
  constructor(
    private capacity: ResourceCapacity,
    private readonly allocations = new Map<string, ResourceAllocation>()
  ) {}

  get available(): ResourceCapacity {
    const used = this.used();
    return {
      cpuCores: this.capacity.cpuCores - used.cpuCores,
      ramMb: this.capacity.ramMb - used.ramMb,
      storageMb: this.capacity.storageMb - used.storageMb,
    };
  }

  canAllocate(request: ResourceAllocation): boolean {
    const available = this.available;
    return (
      request.cpuCores > 0 &&
      request.ramMb > 0 &&
      request.storageMb > 0 &&
      request.cpuCores <= available.cpuCores &&
      request.ramMb <= available.ramMb &&
      request.storageMb <= available.storageMb
    );
  }

  allocate(id: string, request: ResourceAllocation): ResourceAllocation {
    if (this.allocations.has(id)) throw new Error(`Resource allocation already exists: ${id}`);
    if (!this.canAllocate(request)) throw new Error('Insufficient emulator resources');
    const allocation = { ...request };
    this.allocations.set(id, allocation);
    return { ...allocation };
  }

  release(id: string): boolean {
    return this.allocations.delete(id);
  }

  get(id: string): ResourceAllocation | undefined {
    const allocation = this.allocations.get(id);
    return allocation ? { ...allocation } : undefined;
  }

  private used(): ResourceAllocation {
    return Array.from(this.allocations.values()).reduce(
      (total, allocation) => ({
        cpuCores: total.cpuCores + allocation.cpuCores,
        ramMb: total.ramMb + allocation.ramMb,
        storageMb: total.storageMb + allocation.storageMb,
      }),
      { cpuCores: 0, ramMb: 0, storageMb: 0 }
    );
  }
}
