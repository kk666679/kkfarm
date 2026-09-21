import { AdbAllowlist } from './adb/allowlist';
import { InMemoryAdbBridge } from './adb/bridge';
import { EmulatorLifecycle } from './lifecycle/lifecycle';
import { ResourceAllocator } from './lifecycle/resource-allocator';
import { ResourceGovernor } from './lifecycle/resource-governor';
import { EmulatorProfileCatalog } from './profiles/catalog';
import { EmulatorProfileCustomizer } from './profiles/customizer';
import { SnapshotManager } from './profiles/snapshot-manager';
import { ResourceMonitor } from './performance/resource-monitor';
import type {
  AdbCommand,
  AdbResult,
  EmulatorInstance,
  EmulatorManager,
  EmulatorProfile,
  EmulatorSnapshot,
  ResourceAllocation,
} from './types';

export * from './types';
export * from './lifecycle/emulator-instance';
export * from './lifecycle/lifecycle';
export * from './lifecycle/resource-allocator';
export * from './lifecycle/resource-governor';
export * from './versions/version-registry';
export * from './versions/compatibility-matrix';
export * from './versions/image-manager';
export * from './profiles/catalog';
export * from './profiles/customizer';
export * from './profiles/snapshot-manager';
export * from './apk/analyzer';
export * from './apk/dependency-resolver';
export * from './apk/installer';
export * from './adb/allowlist';
export * from './adb/schema';
export * from './adb/bridge';
export * from './adb/controller';
export * from './adb/log-streamer';
export * from './performance/resource-monitor';
export * from './performance/profiler';
export * from './performance/alert-engine';
export * from './testing/test-runner';
export * from './testing/suite-manager';
export * from './testing/report-generator';
export * from './observability/tracer';
export * from './observability/metrics';

let sequence = 0;

function nextId(prefix: string): string {
  sequence += 1;
  return `${prefix}-${Date.now()}-${sequence}`;
}

export class InMemoryEmulatorManager implements EmulatorManager {
  readonly profiles = new Map<string, EmulatorProfile>();
  readonly instances = new Map<string, EmulatorInstance>();
  readonly snapshots = new Map<string, EmulatorSnapshot>();
  readonly adbAllowlist: AdbAllowlist;
  readonly resourceAllocator: ResourceAllocator;
  readonly resourceGovernor: ResourceGovernor;
  readonly profileCatalog: EmulatorProfileCatalog;
  readonly profileCustomizer: EmulatorProfileCustomizer;
  readonly snapshotManager: SnapshotManager;
  readonly resourceMonitor: ResourceMonitor;
  private readonly bridge: InMemoryAdbBridge;

  constructor(
    capacity = { cpuCores: 32, ramMb: 131072, storageMb: 2097152 },
    limits = { cpuCores: 16, ramMb: 65536, storageMb: 1048576, maxInstances: 20 }
  ) {
    this.adbAllowlist = new AdbAllowlist();
    this.bridge = new InMemoryAdbBridge(this.adbAllowlist);
    this.resourceAllocator = new ResourceAllocator(capacity);
    this.resourceGovernor = new ResourceGovernor(limits);
    this.profileCatalog = new EmulatorProfileCatalog();
    this.profileCustomizer = new EmulatorProfileCustomizer();
    this.snapshotManager = new SnapshotManager();
    this.resourceMonitor = new ResourceMonitor();
  }

  createProfile(profile: Omit<EmulatorProfile, 'id' | 'createdAt'>): EmulatorProfile {
    if (
      !profile.name.trim() ||
      profile.apiLevel < 29 ||
      profile.ramMb <= 0 ||
      profile.storageMb <= 0
    ) {
      throw new Error('Invalid emulator profile');
    }
    const created: EmulatorProfile = {
      ...profile,
      id: nextId('emu-profile'),
      tags: profile.tags ? [...profile.tags] : [],
      createdAt: new Date().toISOString(),
    };
    this.profiles.set(created.id, created);
    this.profileCatalog.add(created);
    return { ...created, tags: created.tags ? [...created.tags] : [] };
  }

  getProfile(id: string): EmulatorProfile | undefined {
    const profile = this.profiles.get(id);
    return profile ? { ...profile, tags: profile.tags ? [...profile.tags] : [] } : undefined;
  }

  listProfiles(): EmulatorProfile[] {
    return this.profileCatalog
      .list()
      .map(profile => ({ ...profile, tags: profile.tags ? [...profile.tags] : [] }));
  }

  removeProfile(id: string): boolean {
    if (
      Array.from(this.instances.values()).some(
        instance => instance.profileId === id && instance.state !== 'stopped'
      )
    ) {
      throw new Error('Cannot remove a profile with a running emulator');
    }
    const removed = this.profiles.delete(id);
    if (removed) this.profileCatalog.remove(id);
    return removed;
  }

  async start(
    profileId: string,
    allocation: ResourceAllocation = { cpuCores: 2, ramMb: 4096, storageMb: 8192 }
  ): Promise<EmulatorInstance> {
    const profile = this.profiles.get(profileId);
    if (!profile) throw new Error(`Profile not found: ${profileId}`);
    this.resourceGovernor.validate(allocation, this.instances.size);
    const instanceId = nextId('inst');
    const assigned = this.resourceAllocator.allocate(instanceId, allocation);
    const instance: EmulatorInstance = {
      id: instanceId,
      profileId,
      state: 'stopped',
      adbSerial: `emulator-${5554 + this.instances.size * 2}`,
      allocation: assigned,
    };
    this.instances.set(instance.id, instance);
    try {
      const running = await new EmulatorLifecycle().start(instance);
      this.instances.set(running.id, running);
      return {
        ...running,
        ...(running.allocation ? { allocation: { ...running.allocation } } : {}),
      };
    } catch (error) {
      this.resourceAllocator.release(instance.id);
      this.instances.delete(instance.id);
      throw error;
    }
  }

  async stop(instanceId: string): Promise<void> {
    const lifecycle = new EmulatorLifecycle();
    const instance = this.instances.get(instanceId);
    if (!instance) throw new Error(`Emulator instance not found: ${instanceId}`);
    if (instance.state === 'stopped') return;
    const stopped = await lifecycle.stop(instanceId);
    this.instances.set(instanceId, stopped);
    this.resourceAllocator.release(instanceId);
  }

  async executeAdb(command: AdbCommand): Promise<AdbResult> {
    const instance = Array.from(this.instances.values()).find(
      candidate => candidate.adbSerial === command.serial && candidate.state === 'running'
    );
    if (!instance) throw new Error(`Running emulator not found for serial: ${command.serial}`);
    return this.bridge.execute(command);
  }

  createSnapshot(instanceId: string, name: string, sizeMb = 1024): EmulatorSnapshot {
    const instance = this.instances.get(instanceId);
    if (!instance) throw new Error(`Emulator instance not found: ${instanceId}`);
    const snapshot = this.snapshotManager.create(instance, name, sizeMb);
    this.snapshots.set(snapshot.id, snapshot);
    return { ...snapshot };
  }

  listSnapshots(instanceId?: string): EmulatorSnapshot[] {
    return Array.from(this.snapshots.values())
      .filter(snapshot => !instanceId || snapshot.instanceId === instanceId)
      .map(snapshot => ({ ...snapshot }));
  }

  getInstance(id: string): EmulatorInstance | undefined {
    const instance = this.instances.get(id);
    return instance
      ? { ...instance, ...(instance.allocation ? { allocation: { ...instance.allocation } } : {}) }
      : undefined;
  }

  listInstances(): EmulatorInstance[] {
    return Array.from(this.instances.values()).map(instance => ({
      ...instance,
      ...(instance.allocation ? { allocation: { ...instance.allocation } } : {}),
    }));
  }
}

export default {
  InMemoryEmulatorManager,
  EmulatorLifecycle,
  ResourceAllocator,
  ResourceGovernor,
  EmulatorProfileCatalog,
  EmulatorProfileCustomizer,
  SnapshotManager,
  AdbAllowlist,
  InMemoryAdbBridge,
  ResourceMonitor,
};
