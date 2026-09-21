import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { DEFAULT_CHART_HEIGHT } from '../theme';

interface ChartSkeletonProps {
  height?: number;
  className?: string;
  withLegend?: boolean;
}

export function ChartSkeleton({
  height = DEFAULT_CHART_HEIGHT,
  className,
  withLegend = true,
}: ChartSkeletonProps) {
  return (
    <div className={cn('w-full space-y-3', className)}>
      {withLegend && (
        <div className="flex gap-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-14" />
        </div>
      )}
      <Skeleton className="w-full rounded-lg" style={{ height }} />
    </div>
  );
}
