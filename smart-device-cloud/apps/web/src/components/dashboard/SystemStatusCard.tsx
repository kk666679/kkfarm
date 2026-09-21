import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/components/charts';

export type ServiceStatus = 'healthy' | 'degraded' | 'down' | 'unknown';

export interface ServiceEntry {
  name: string;
  status: ServiceStatus;
  latencyMs?: number;
  note?: string;
}

interface SystemStatusCardProps {
  services: ServiceEntry[];
  title?: string;
  className?: string;
}

const DOT: Record<ServiceStatus, string> = {
  healthy: 'bg-emerald-500',
  degraded: 'bg-amber-500',
  down: 'bg-destructive',
  unknown: 'bg-muted-foreground',
};

const LABEL: Record<ServiceStatus, string> = {
  healthy: 'Healthy',
  degraded: 'Degraded',
  down: 'Down',
  unknown: 'Unknown',
};

export function SystemStatusCard({
  services,
  title = 'System status',
  className,
}: SystemStatusCardProps) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {services.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No services to report.
          </p>
        ) : (
          <ul role="list" className="divide-y divide-border">
            {services.map(s => (
              <li key={s.name} className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
                <span className="flex items-center gap-2 text-sm text-foreground">
                  <span
                    className={cn('h-2 w-2 rounded-full', DOT[s.status])}
                    aria-hidden="true"
                  />
                  {s.name}
                </span>
                <span className="flex items-center gap-3 text-xs text-muted-foreground">
                  {s.note && <span>{s.note}</span>}
                  {typeof s.latencyMs === 'number' && (
                    <span className="tabular-nums">{formatDuration(s.latencyMs)}</span>
                  )}
                  <span className="sr-only">{LABEL[s.status]}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
