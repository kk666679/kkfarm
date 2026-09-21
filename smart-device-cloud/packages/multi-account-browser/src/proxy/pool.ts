import type { ProxyEndpoint, ProxyHealth } from '../types';

export class ProxyPool {
  private readonly proxies = new Map<string, ProxyEndpoint>();

  add(proxy: ProxyEndpoint): void {
    this.proxies.set(proxy.id, { ...proxy });
  }

  available(country?: string): ProxyEndpoint[] {
    return Array.from(this.proxies.values())
      .filter(proxy => proxy.health !== 'unhealthy' && (!country || proxy.country === country))
      .map(proxy => ({ ...proxy }));
  }

  markHealth(id: string, health: ProxyHealth): void {
    const proxy = this.proxies.get(id);
    if (!proxy) throw new Error(`Proxy not found: ${id}`);
    this.proxies.set(id, {
      ...proxy,
      health,
      lastCheckedAt: new Date().toISOString(),
      failureCount: health === 'unhealthy' ? proxy.failureCount + 1 : 0,
    });
  }

  remove(id: string): boolean {
    return this.proxies.delete(id);
  }
}
