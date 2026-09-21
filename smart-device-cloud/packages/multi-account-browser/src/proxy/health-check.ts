import type { ProxyEndpoint, ProxyHealth } from '../types';

export class ProxyHealthChecker {
  constructor(private readonly probe: (proxy: ProxyEndpoint) => Promise<boolean>) {}

  async check(proxy: ProxyEndpoint): Promise<ProxyHealth> {
    try {
      return (await this.probe(proxy)) ? 'healthy' : 'degraded';
    } catch {
      return 'unhealthy';
    }
  }
}
