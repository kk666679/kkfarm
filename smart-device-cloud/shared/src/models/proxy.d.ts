export type ProxyType = 'http' | 'https' | 'socks5' | 'residential' | 'datacenter';
export interface Proxy {
  id: string;
  url: string;
  type: ProxyType;
  credentials?: {
    username?: string;
    password?: string;
  };
  country?: string;
  city?: string;
  rotationSchedule?: string;
  isActive: boolean;
  failureCount: number;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}
//# sourceMappingURL=proxy.d.ts.map
