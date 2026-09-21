import type { IntegrationConfig } from '../types';

export class IntegrationConfigStore {
  private readonly configs = new Map<string, IntegrationConfig>();

  save(config: IntegrationConfig): void {
    this.configs.set(config.id, {
      ...config,
      ...(config.credentials ? { credentials: { ...config.credentials } } : {}),
      config: { ...config.config },
    });
  }

  get(id: string): IntegrationConfig | undefined {
    const config = this.configs.get(id);
    return config
      ? {
          ...config,
          ...(config.credentials ? { credentials: { ...config.credentials } } : {}),
          config: { ...config.config },
        }
      : undefined;
  }

  list(): IntegrationConfig[] {
    return Array.from(this.configs.values()).map(config => ({
      ...config,
      ...(config.credentials ? { credentials: { ...config.credentials } } : {}),
      config: { ...config.config },
    }));
  }

  delete(id: string): boolean {
    return this.configs.delete(id);
  }
}
