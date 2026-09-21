import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ReactNode } from 'react';
import { ChartContainer, ChartTooltip } from '../primitives';
import {
  AXIS_STYLE,
  CHART_PALETTE,
  DEFAULT_CHART_HEIGHT,
  GRID_STYLE,
  prefersReducedMotion,
} from '../theme';
import { formatCompactNumber } from '../format';

export interface AreaSeries {
  dataKey: string;
  label?: string;
  color?: string;
  fillOpacity?: number;
  stackId?: string;
}

interface AreaChartBaseProps {
  children?: ReactNode;
  data: ReadonlyArray<any>;
  xKey: string;
  series: AreaSeries[];
  height?: number;
  ariaLabel: string;
  ariaDescription?: string;
  className?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  xTickFormatter?: (v: string) => string;
  yTickFormatter?: (v: number) => string;
}

export function AreaChartBase({
  children,
  data,
  xKey,
  series,
  height = DEFAULT_CHART_HEIGHT,
  ariaLabel,
  ariaDescription,
  className,
  showLegend = true,
  showGrid = true,
  xTickFormatter,
  yTickFormatter,
}: AreaChartBaseProps) {
  const noAnim = prefersReducedMotion();

  return (
    <ChartContainer
      ariaLabel={ariaLabel}
      ariaDescription={ariaDescription}
      height={height}
      className={className}
    >
      <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        {showGrid && <CartesianGrid {...GRID_STYLE} />}
        <XAxis
          dataKey={xKey}
          tick={AXIS_STYLE}
          tickLine={false}
          axisLine={false}
          tickFormatter={xTickFormatter}
        />
        <YAxis
          tick={AXIS_STYLE}
          tickLine={false}
          axisLine={false}
          tickFormatter={yTickFormatter ?? formatCompactNumber}
          width={44}
        />
        <Tooltip
          content={
            <ChartTooltip
              labelFormatter={xTickFormatter ? v => xTickFormatter(String(v)) : undefined}
            />
          }
          cursor={{ stroke: 'var(--border)', strokeDasharray: '3 3' }}
        />
        {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {series.map((s, i) => {
          const color = s.color ?? CHART_PALETTE[i % CHART_PALETTE.length];
          return (
            <Area
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.label ?? s.dataKey}
              stroke={color}
              fill={color}
              fillOpacity={s.fillOpacity ?? 0.15}
              stackId={s.stackId}
              isAnimationActive={!noAnim}
              connectNulls
            />
          );
        })}
        {children}

      </AreaChart>
    </ChartContainer>
  );
}
