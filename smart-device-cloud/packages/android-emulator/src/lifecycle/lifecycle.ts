import type { EmulatorInstance, EmulatorState } from '../types';
import { EmulatorInstanceLifecycle } from './emulator-instance';

export class EmulatorLifecycle {
  private readonly instances = new Map<string, EmulatorInstance>();

  register(instance: EmulatorInstance): void {
    this.instances.set(instance.id, instance);
  }

  get(id: string): EmulatorInstance | undefined {
    return this.instances.get(id);
  }

  async start(instance: EmulatorInstance): Promise<EmulatorInstance> {
    const starting = EmulatorInstanceLifecycle.transition(instance, 'starting');
    this.instances.set(starting.id, starting);
    await Promise.resolve();
    const running = EmulatorInstanceLifecycle.transition(starting, 'running');
    this.instances.set(running.id, running);
    return running;
  }

  async stop(id: string): Promise<EmulatorInstance> {
    const instance = this.instances.get(id);
    if (!instance) throw new Error(`Emulator instance not found: ${id}`);
    const stopping = EmulatorInstanceLifecycle.transition(instance, 'stopping');
    this.instances.set(stopping.id, stopping);
    await Promise.resolve();
    const stopped = EmulatorInstanceLifecycle.transition(stopping, 'stopped');
    this.instances.set(stopped.id, stopped);
    return stopped;
  }

  transition(id: string, state: EmulatorState): EmulatorInstance {
    const instance = this.instances.get(id);
    if (!instance) throw new Error(`Emulator instance not found: ${id}`);
    const updated = EmulatorInstanceLifecycle.transition(instance, state);
    this.instances.set(id, updated);
    return updated;
  }
}
