import type { EmulatorInstance, EmulatorState } from '../types';

export class EmulatorInstanceLifecycle {
  static canTransition(from: EmulatorState, to: EmulatorState): boolean {
    const transitions: Record<EmulatorState, EmulatorState[]> = {
      stopped: ['starting', 'error'],
      starting: ['running', 'error', 'stopping'],
      running: ['stopping', 'error'],
      stopping: ['stopped', 'error'],
      error: ['stopped', 'starting'],
    };
    return transitions[from]?.includes(to) ?? false;
  }

  static transition(
    instance: EmulatorInstance,
    next: EmulatorState,
    now = new Date().toISOString()
  ): EmulatorInstance {
    if (!EmulatorInstanceLifecycle.canTransition(instance.state, next)) {
      throw new Error(`Invalid emulator transition: ${instance.state} -> ${next}`);
    }
    const updated: EmulatorInstance = { ...instance, state: next };
    if (next === 'running') updated.startedAt = now;
    if (next === 'stopped') updated.stoppedAt = now;
    return updated;
  }
}

export function createInstance(id: string, profileId: string, adbSerial: string): EmulatorInstance {
  return { id, profileId, state: 'stopped', adbSerial };
}
