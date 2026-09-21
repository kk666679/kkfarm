import { BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DEFAULT_CHART_HEIGHT } from '../theme';

interface ChartEmptyStateProps {
  message?: string;
  height?: number;
  className?: string;
  action?: { label: string; onClick: () => void };
}

export function ChartEmptyState({
  message = 'No data for this range.',
  height = DEFAULT_CHART_HEIGHT,
  className,
  action,
}: ChartEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 text-center',
        className
      )}
      style={{ height }}
    >
      <BarChart3 className="mb-2 h-6 w-6 text-muted-foreground" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">{message}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-3 text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
