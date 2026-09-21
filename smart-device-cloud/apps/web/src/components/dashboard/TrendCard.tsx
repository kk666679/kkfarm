import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { MetricValue } from '@/components/common';
import { Sparkline } from '@/components/charts';

interface TrendCardProps {
  label: string;
  value: number | string;
  unit?: string;
  /** Fraction delta — 0.05 renders as +5%. */
  delta?: number;
  /** If true, positive delta renders red. */
  invertDelta?: boolean;
  /** Sparkline data — raw numbers. */
  trend?: number[];
  trendVariant?: 'line' | 'area';
  className?: string;
}

export function TrendCard({
  label,
  value,
  unit,
  delta,
  invertDelta,
  trend,
  trendVariant = 'area',
  className,
}: TrendCardProps) {
  const trendDir =
    typeof delta === 'number' && delta > 0.001
      ? 'up'
      : typeof delta === 'number' && delta < -0.001
        ? 'down'
        : 'neutral';

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-4">
        <MetricValue
          label={label}
          value={value}
          unit={unit}
          delta={delta}
          invertDelta={invertDelta}
          trailing={
            trend && trend.length > 1 ? (
              <Sparkline
                data={trend}
                variant={trendVariant}
                trend={trendDir}
                ariaLabel={`${label} trend`}
                width={120}
              />
            ) : undefined
          }
        />
      </CardContent>
    </Card>
  );
}
