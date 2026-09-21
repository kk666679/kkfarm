import { format, formatDistanceToNowStrict, parseISO } from 'date-fns';

export function formatCompactNumber(value: number): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

export function formatNumber(value: number, digits = 0): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatPercent(value: number, digits = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  // Accept either 0..1 or 0..100
  const pct = value <= 1 && value >= -1 ? value * 100 : value;
  return `${pct.toFixed(digits)}%`;
}

export function formatDuration(ms: number): string {
  if (ms === null || ms === undefined || Number.isNaN(ms)) return '—';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  const rs = Math.floor(s % 60);
  if (m < 60) return `${m}m ${rs}s`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return `${h}h ${rm}m`;
}

export function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function formatTimestamp(iso: string, pattern = 'MMM d, HH:mm'): string {
  try {
    return format(parseISO(iso), pattern);
  } catch {
    return iso;
  }
}

export function formatRelativeTime(iso: string): string {
  try {
    return formatDistanceToNowStrict(parseISO(iso), { addSuffix: true });
  } catch {
    return iso;
  }
}

/** Axis tick formatter for time series. Picks a granularity from the range. */
export function makeTimeAxisFormatter(
  points: string[]
): (value: string) => string {
  if (points.length < 2) return v => v;
  const first = new Date(points[0]).getTime();
  const last = new Date(points[points.length - 1]).getTime();
  const spanMs = last - first;
  const hour = 3_600_000;
  const day = 24 * hour;

  if (spanMs <= 2 * hour) return v => format(new Date(v), 'HH:mm');
  if (spanMs <= 2 * day) return v => format(new Date(v), 'HH:mm');
  if (spanMs <= 30 * day) return v => format(new Date(v), 'MMM d');
  return v => format(new Date(v), 'MMM d');
}
