import type { ProxyEndpoint } from '../types';

export class ProxyRotator {
  private index = 0;

  next(proxies: readonly ProxyEndpoint[]): ProxyEndpoint {
    if (proxies.length === 0) throw new Error('No healthy proxies available');
    const proxy = proxies[this.index % proxies.length];
    this.index += 1;
    if (!proxy) throw new Error('No healthy proxies available');
    return { ...proxy };
  }
}
