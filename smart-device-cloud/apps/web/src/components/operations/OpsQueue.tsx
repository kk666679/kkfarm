import { Clock, Loader2, Pause, Play, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export type QueueItemStatus = 'queued' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';

export interface OpsQueueItem {
  id: string;
  label: string;
  status: QueueItemStatus;
  enqueuedAt: string;
  startedAt?: string;
  deviceCount?: number;
  progress?: number;
  workflowId?: string;
  error?: string;
}

interface OpsQueueProps {
  items: OpsQueueItem[];
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
  onCancel?: (id: string) => void;
  onInspect?: (id: string) => void;
  className?: string;
}

const STATUS_META: Record<
  QueueItemStatus,
  { label: string; className: string; icon: typeof Clock }
> = {
  queued: { label: 'Queued', className: 'bg-muted text-muted-foreground', icon: Clock },
  running: { label: 'Running', className: 'bg-primary/10 text-primary', icon: Loader2 },
  paused: { label: 'Paused', className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400', icon: Pause },
  completed: { label: 'Completed', className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400', icon: Play },
  failed: { label: 'Failed', className: 'bg-destructive/10 text-destructive', icon: XCircle },
  cancelled: { label: 'Cancelled', className: 'bg-muted text-muted-foreground', icon: XCircle },
};

function age(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h`;
}

export function OpsQueue({
  items,
  onPause,
  onResume,
  onCancel,
  onInspect,
  className,
}: OpsQueueProps) {
  if (items.length === 0) {
    return (
      <div
        className={cn(
          'rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground',
          className
        )}
      >
        Queue is empty.
      </div>
    );
  }

  return (
    <ul role="list" className={cn('divide-y divide-border rounded-lg border border-border', className)}>
      {items.map(item => {
        const meta = STATUS_META[item.status];
        const Icon = meta.icon;
        const spinning = item.status === 'running';

        return (
          <li key={item.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium',
                    meta.className
                  )}
                >
                  <Icon className={cn('h-3 w-3', spinning && 'animate-spin')} aria-hidden="true" />
                  {meta.label}
                </span>
                <span className="truncate text-sm font-medium text-foreground">{item.label}</span>
                {item.deviceCount !== undefined && (
                  <span className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {item.deviceCount} device{item.deviceCount === 1 ? '' : 's'}
                  </span>
                )}
              </div>

              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="tabular-nums">queued {age(item.enqueuedAt)}</span>
                {item.error && <span className="truncate text-destructive">{item.error}</span>}
              </div>

              {typeof item.progress === 'number' && item.status === 'running' && (
                <Progress value={item.progress * 100} className="mt-2 h-1" />
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1">
              {onInspect && (
                <button
                  type="button"
                  onClick={() => onInspect(item.id)}
                  className="rounded px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Inspect
                </button>
              )}
              {item.status === 'running' && onPause && (
                <button
                  type="button"
                  onClick={() => onPause(item.id)}
                  aria-label="Pause"
                  className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Pause className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
              {item.status === 'paused' && onResume && (
                <button
                  type="button"
                  onClick={() => onResume(item.id)}
                  aria-label="Resume"
                  className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Play className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
              {(item.status === 'queued' || item.status === 'running' || item.status === 'paused') &&
                onCancel && (
                  <button
                    type="button"
                    onClick={() => onCancel(item.id)}
                    aria-label="Cancel"
                    className="rounded p-1.5 text-destructive hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <XCircle className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
