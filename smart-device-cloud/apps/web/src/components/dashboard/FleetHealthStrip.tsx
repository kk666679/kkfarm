import { cn } from '@/lib/utils';
import { STATUS_COLORS, type FleetStatusCounts } from '@/components/charts';
import { RelativeTime } from '@/components/common';

export type ConnectionStatus = 'live' | 'polling' | 'stale';

interface FleetHealthStripProps {
  counts: FleetStatusCounts;
  connectionStatus?: ConnectionStatus;
  lastUpdated?: string;
  className?: string;
}

const LABEL: Record<keyof FleetStatusCounts, string> = {
  online: 'online',
  offline: 'offline',
  busy: 'busy',
  idle: 'idle',
  error: 'error',
  maintenance: 'maintenance',
  provisioning: 'provisioning',
};

export function FleetHealthStrip({
  counts,
  connectionStatus = 'live',
  lastUpdated,
  className,
}: FleetHealthStripProps) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const visible = (Object.keys(LABEL) as Array<keyof FleetStatusCounts>).filter(
    k => counts[k] > 0
  );

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Fleet health summary"
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border bg-card px-4 py-2.5 text-xs',
        className
      )}
    >
      <span className="font-semibold text-foreground">
        {total} device{total === 1 ? '' : 's'}
      </span>

      {visible.map(k => (
        <span key={k} className="flex items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: STATUS_COLORS[k] }}
            aria-hidden="true"
          />
          <span className="font-medium tabular-nums text-foreground">{counts[k]}</span>
          <span className="text-muted-foreground">{LABEL[k]}</span>
        </span>
      ))}

      <div className="ml-auto flex items-center gap-3 text-muted-foreground">
        <ConnectionIndicator status={connectionStatus} />
        {lastUpdated && <RelativeTime value={lastUpdated} />}
      </div>
    </div>
  );
}

function ConnectionIndicator({ status }: { status: ConnectionStatus }) {
  const cfg = {
    live: { dot: 'bg-emerald-500', label: 'Live' },
    polling: { dot: 'bg-amber-500', label: 'Polling' },
    stale: { dot: 'bg-destructive', label: 'Stale' },
  }[status];
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} aria-hidden="true" />
      {cfg.label}
    </span>
  );
}
