import { useId } from 'react';
import { Area, AreaChart, Line, LineChart } from 'recharts';
import { cn } from '@/lib/utils';
import {
  DEFAULT_SPARKLINE_HEIGHT,
  SEMANTIC_COLORS,
  prefersReducedMotion,
} from '../theme';

interface SparklineProps {
  data: number[] | Array<{ v: number }>;
  width?: number;
  height?: number;
  color?: string;
  variant?: 'line' | 'area';
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
  ariaLabel: string;
}

/**
 * Minimal inline trend indicator.
 *
 * No axes, no grid, no tooltip — meant to sit inside KPI cards or table cells.
 * If `color` is not given, it's chosen from `trend`:
 *   up → success, down → danger, neutral → muted
 */
export function Sparkline({
  data,
  width = 96,
  height = DEFAULT_SPARKLINE_HEIGHT,
  color,
  variant = 'area',
  trend = 'neutral',
  className,
  ariaLabel,
}: SparklineProps) {
  const gid = useId();
  const noAnim = prefersReducedMotion();
  const points = Array.isArray(data) && typeof data[0] === 'number'
    ? (data as number[]).map((v, i) => ({ i, v }))
    : (data as Array<{ v: number }>);

  const stroke =
    color ??
    (trend === 'up'
      ? SEMANTIC_COLORS.success
      : trend === 'down'
        ? SEMANTIC_COLORS.danger
        : SEMANTIC_COLORS.muted);

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn('inline-block', className)}
      style={{ width, height }}
    >
      {variant === 'area' ? (
        <AreaChart width={width} height={height} data={points} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <defs>
            <linearGradient id={`spark-${gid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={stroke}
            strokeWidth={1.5}
            fill={`url(#spark-${gid})`}
            isAnimationActive={!noAnim}
          />
        </AreaChart>
      ) : (
        <LineChart width={width} height={height} data={points} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={stroke}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={!noAnim}
          />
        </LineChart>
      )}
    </div>
  );
}
