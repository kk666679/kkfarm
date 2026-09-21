import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { RelativeTime } from '@/components/common';

interface QueueDepthCardProps {
  queued: number;
  running: number;
  failed: number;
  /** ISO timestamp of the oldest still-queued item. */
  oldestQueuedAt?: string;
  /** Completed in the last hour. */
  throughputLastHour?: number;
  title?: string;
  className?: string;
  onOpenQueue?: () => void;
}

export function QueueDepthCard({
  queued,
  running,
  failed,
  oldestQueuedAt,
  throughputLastHour,
  title = 'Queue depth',
  className,
  onOpenQueue,
}: QueueDepthCardProps) {
  const cells = [
    { label: 'Queued', value: queued, tone: 'text-foreground' },
    { label: 'Running', value: running, tone: 'text-primary' },
    { label: 'Failed', value: failed, tone: failed > 0 ? 'text-destructive' : 'text-muted-foreground' },
  ];

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {onOpenQueue && (
          <button
            type="button"
            onClick={onOpenQueue}
            className="rounded text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Open queue
          </button>
        )}
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <dl className="grid grid-cols-3 gap-3">
          {cells.map(c => (
            <div key={c.label}>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {c.label}
              </dt>
              <dd className={cn('mt-1 text-2xl font-semibold tabular-nums', c.tone)}>
                {c.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
          {oldestQueuedAt ? (
            <span>
              Oldest:{' '}
              <RelativeTime value={oldestQueuedAt} className="text-foreground" />
            </span>
          ) : (
            <span>Queue empty</span>
          )}
          {typeof throughputLastHour === 'number' && (
            <span>
              <span className="font-medium tabular-nums text-foreground">
                {throughputLastHour}
              </span>{' '}
              / hr
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
