import type { EmulatorInstance, EmulatorSnapshot, EmulatorState } from '../types';

export class SnapshotManager {
  private readonly snapshots = new Map<string, EmulatorSnapshot>();

  create(instance: EmulatorInstance, name: string, sizeMb = 1024): EmulatorSnapshot {
    if (instance.state !== 'running') throw new Error('Snapshots require a running emulator');
    const snapshot: EmulatorSnapshot = {
      id: `snap-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      instanceId: instance.id,
      name,
      createdAt: new Date().toISOString(),
      sizeMb,
      state: instance.state,
    };
    this.snapshots.set(snapshot.id, snapshot);
    return { ...snapshot };
  }

  restore(snapshotId: string, instance: EmulatorInstance): EmulatorInstance {
    const snapshot = this.snapshots.get(snapshotId);
    if (!snapshot) throw new Error(`Snapshot not found: ${snapshotId}`);
    if (snapshot.instanceId !== instance.id)
      throw new Error('Snapshot belongs to another emulator');
    return { ...instance, state: 'running' as EmulatorState, startedAt: new Date().toISOString() };
  }

  list(instanceId?: string): EmulatorSnapshot[] {
    return Array.from(this.snapshots.values())
      .filter(snapshot => !instanceId || snapshot.instanceId === instanceId)
      .map(snapshot => ({ ...snapshot }));
  }

  delete(snapshotId: string): boolean {
    return this.snapshots.delete(snapshotId);
  }
}
