export function formatPartnerName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

export function getPartnerPlanColor(plan: string): string {
  const colors: Record<string, string> = {
    Starter: 'text-slate-400',
    Pro: 'text-blue-400',
    Enterprise: 'text-purple-400',
  };
  return colors[plan] ?? 'text-slate-400';
}

export function formatApiKeyPrefix(key: string): string {
  if (key.length <= 8) return key;
  return `${key.slice(0, 8)}...${key.slice(-4)}`;
}

export function generateWebhookSecret(): string {
  const chars = 'abcdef0123456789';
  let result = 'whsec_';
  for (let i = 0; i < 32; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)}KB`;
  if (bytes < 1_073_741_824) return `${(bytes / 1_048_576).toFixed(1)}MB`;
  return `${(bytes / 1_073_741_824).toFixed(1)}GB`;
}

export function formatRelativeUsage(current: number, limit: number): string {
  const pct = limit > 0 ? (current / limit) * 100 : 0;
  return `${pct.toFixed(1)}% of ${formatBytes(limit)}`;
}

export function getUsageStatus(current: number, limit: number): 'ok' | 'warning' | 'critical' {
  const pct = limit > 0 ? current / limit : 0;
  if (pct > 0.9) return 'critical';
  if (pct > 0.75) return 'warning';
  return 'ok';
}
