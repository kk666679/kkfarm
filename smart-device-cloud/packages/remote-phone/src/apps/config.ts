export interface RemoteAppConfig {
  packageName: string;
  autoStart: boolean;
  permissions: string[];
  environment: Record<string, string>;
}

export class RemoteAppConfigManager {
  private readonly configs = new Map<string, RemoteAppConfig>();

  save(config: RemoteAppConfig): void {
    this.configs.set(config.packageName, {
      ...config,
      permissions: [...config.permissions],
      environment: { ...config.environment },
    });
  }

  get(packageName: string): RemoteAppConfig | undefined {
    const config = this.configs.get(packageName);
    return config
      ? { ...config, permissions: [...config.permissions], environment: { ...config.environment } }
      : undefined;
  }
}
