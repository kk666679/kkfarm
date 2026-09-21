import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCompactNumber, formatPercent } from '@/components/charts';

type Trend = 'up' | 'down' | 'flat';

interface MetricValueProps {
  label: string;
  value: number | string;
  unit?: string;
  format?: (n: number) => string;
  delta?: number;
  /** If true, positive delta renders red. */
  invertDelta?: boolean;
  trailing?: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE = {
  sm: { value: 'text-lg', label: 'text-[10px]', unit: 'text-xs' },
  md: { value: 'text-2xl', label: 'text-xs', unit: 'text-sm' },
  lg: { value: 'text-3xl', label: 'text-xs', unit: 'text-base' },
} as const;

function trendIcon(d: number): typeof ArrowUp {
  if (d > 0.001) return ArrowUp;
  if (d < -0.001) return ArrowDown;
  return Minus;
}

export function MetricValue({
  label,
  value,
  unit,
  format,
  delta,
  invertDelta = false,
  trailing,
  className,
  size = 'md',
}: MetricValueProps) {
  const s = SIZE[size];
  const display =
    typeof value === 'number'
      ? format
        ? format(value)
        : formatCompactNumber(value)
      : value;

  let deltaEl: ReactNode = null;
  if (typeof delta === 'number' && Number.isFinite(delta)) {
    const Icon = trendIcon(delta);
    const isUp = delta > 0.001;
    const isFlat = Math.abs(delta) <= 0.001;
    const positive = invertDelta ? !isUp : isUp;
    deltaEl = (
      <span
        className={cn(
          'inline-flex items-center gap-0.5 text-xs tabular-nums',
          isFlat && 'text-muted-foreground',
          !isFlat && positive && 'text-emerald-600 dark:text-emerald-400',
          !isFlat && !positive && 'text-destructive'
        )}
      >
        <Icon className="h-3 w-3" aria-hidden="true" />
        {formatPercent(Math.abs(delta))}
      </span>
    );
  }

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className={s.label + ' font-medium uppercase tracking-wide text-muted-foreground'}>
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <span className={cn('font-semibold tabular-nums text-foreground', s.value)}>
          {display}
        </span>
        {unit && <span className={cn('text-muted-foreground', s.unit)}>{unit}</span>}
        {deltaEl}
      </div>
      {trailing && <div className="mt-1">{trailing}</div>}
    </div>
  );
}
