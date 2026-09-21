import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { formatPercent } from '@/components/charts';

export interface CapacitySlice {
  used: number;
  total: number;
}

interface CapacityCardProps {
  /** Concurrent live sessions. */
  sessions: CapacitySlice;
  /** Provisioned devices out of allocated fleet. */
  devices: CapacitySlice;
  /** Streaming slots. */
  streaming: CapacitySlice;
  /** Optional cluster-wide percentages. */
  cpu?: number;
  memory?: number;
  storage?: number;
  title?: string;
  className?: string;
}

function pct(s: CapacitySlice): number {
  if (s.total <= 0) return 0;
  return (s.used / s.total) * 100;
}

function tier(value: number): string {
  if (value >= 90) return 'text-destructive';
  if (value >= 75) return 'text-amber-600 dark:text-amber-400';
  return 'text-foreground';
}

function CapacityRow({ label, slice }: { label: string; slice: CapacitySlice }) {
  const value = pct(slice);
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-medium text-muted-foreground">{label}</span>
        <span className={cn('tabular-nums font-medium', tier(value))}>
          {slice.used} / {slice.total}{' '}
          <span className="text-muted-foreground">({formatPercent(value / 100, 0)})</span>
        </span>
      </div>
      <Progress value={value} className="mt-1.5 h-1.5" />
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-medium text-muted-foreground">{label}</span>
        <span className={cn('tabular-nums font-medium', tier(value))}>
          {formatPercent(value / 100, 0)}
        </span>
      </div>
      <Progress value={value} className="mt-1.5 h-1.5" />
    </div>
  );
}

export function CapacityCard({
  sessions,
  devices,
  streaming,
  cpu,
  memory,
  storage,
  title = 'Capacity',
  className,
}: CapacityCardProps) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <CapacityRow label="Sessions" slice={sessions} />
        <CapacityRow label="Devices" slice={devices} />
        <CapacityRow label="Streaming" slice={streaming} />
        {(cpu !== undefined || memory !== undefined || storage !== undefined) && (
          <div className="space-y-3 border-t border-border pt-3">
            {cpu !== undefined && <MetricRow label="CPU" value={cpu} />}
            {memory !== undefined && <MetricRow label="Memory" value={memory} />}
            {storage !== undefined && <MetricRow label="Storage" value={storage} />}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
