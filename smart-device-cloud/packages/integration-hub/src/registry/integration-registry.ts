import { IntegrationConfigStore } from './config-store';
import type { IntegrationConfig, IntegrationRegistry } from '../types';

export class InMemoryIntegrationRegistry implements IntegrationRegistry {
  private readonly store = new IntegrationConfigStore();

  register(config: IntegrationConfig): void {
    if (!config.id.trim() || !config.name.trim())
      throw new Error('Integration ID and name are required');
    this.store.save({
      ...config,
      status: config.isActive ? 'active' : 'disabled',
      updatedAt: new Date().toISOString(),
    });
  }

  get(id: string): IntegrationConfig | undefined {
    return this.store.get(id);
  }

  list(): IntegrationConfig[] {
    return this.store.list();
  }

  remove(id: string): void {
    this.store.delete(id);
  }
}

export { IntegrationConfigStore };
