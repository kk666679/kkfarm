import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AlertsSummaryCardProps {
  critical: number;
  warning: number;
  info: number;
  title?: string;
  className?: string;
  onOpenAlerts?: () => void;
}

interface Row {
  key: 'critical' | 'warning' | 'info';
  label: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

const ROWS: Row[] = [
  { key: 'critical', label: 'Critical', icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
  { key: 'warning', label: 'Warning', icon: AlertTriangle, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
  { key: 'info', label: 'Info', icon: Info, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
];

export function AlertsSummaryCard({
  critical,
  warning,
  info,
  title = 'Alerts',
  className,
  onOpenAlerts,
}: AlertsSummaryCardProps) {
  const counts = { critical, warning, info };
  const total = critical + warning + info;

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {onOpenAlerts && (
          <button
            type="button"
            onClick={onOpenAlerts}
            className="rounded text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            View all
          </button>
        )}
      </CardHeader>
      <CardContent className="flex-1 space-y-2">
        {total === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No active alerts.
          </p>
        ) : (
          <ul role="list" className="space-y-2">
            {ROWS.map(r => {
              const Icon = r.icon;
              const value = counts[r.key];
              return (
                <li
                  key={r.key}
                  className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5"
                >
                  <span className="flex items-center gap-2 text-sm text-foreground">
                    <span className={cn('flex h-6 w-6 items-center justify-center rounded', r.bg)}>
                      <Icon className={cn('h-3.5 w-3.5', r.color)} aria-hidden="true" />
                    </span>
                    {r.label}
                  </span>
                  <span className={cn('tabular-nums font-semibold', value > 0 ? r.color : 'text-muted-foreground')}>
                    {value}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
