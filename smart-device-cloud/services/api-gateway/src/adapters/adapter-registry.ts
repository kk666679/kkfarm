import type { Adapter } from './base.adapter.js';

export class AdapterRegistry {
  private readonly adapters = new Map<string, Adapter>();

  register(name: string, adapter: Adapter): void {
    if (this.adapters.has(name)) {
      throw new Error(`Adapter ${name} already registered`);
    }
    this.adapters.set(name, adapter);
  }

  get(name: string): Adapter {
    const adapter = this.adapters.get(name);
    if (!adapter) throw new Error(`Unknown adapter: ${name}`);
    return adapter;
  }

  asObject(): Record<string, Adapter> {
    return Object.fromEntries(this.adapters);
  }

  async healthAll(): Promise<Record<string, { healthy: boolean; details?: unknown }>> {
    const entries = await Promise.all(
      [...this.adapters.entries()].map(
        async ([name, adapter]) => [name, await adapter.health()] as const
      )
    );
    return Object.fromEntries(entries);
  }

  list(): string[] {
    return [...this.adapters.keys()];
  }
}
