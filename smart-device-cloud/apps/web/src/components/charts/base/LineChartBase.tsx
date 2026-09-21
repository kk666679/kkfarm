import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
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

export interface LineSeries {
  dataKey: string;
  label?: string;
  color?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  dot?: boolean;
}

interface LineChartBaseProps {
  children?: ReactNode;
  data: ReadonlyArray<any>;
  xKey: string;
  series: LineSeries[];
  height?: number;
  ariaLabel: string;
  ariaDescription?: string;
  className?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  xTickFormatter?: (v: string) => string;
  yTickFormatter?: (v: number) => string;
  yUnit?: string;
}

export function LineChartBase({
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
  yUnit,
}: LineChartBaseProps) {
  const noAnim = prefersReducedMotion();

  return (
    <ChartContainer
      ariaLabel={ariaLabel}
      ariaDescription={ariaDescription}
      height={height}
      className={className}
    >
      <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
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
          unit={yUnit}
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
        {series.map((s, i) => (
          <Line
            key={s.dataKey}
            type="monotone"
            dataKey={s.dataKey}
            name={s.label ?? s.dataKey}
            stroke={s.color ?? CHART_PALETTE[i % CHART_PALETTE.length]}
            strokeWidth={s.strokeWidth ?? 2}
            strokeDasharray={s.strokeDasharray}
            dot={s.dot ?? false}
            activeDot={{ r: 4 }}
            isAnimationActive={!noAnim}
            connectNulls
          />
        ))}
        {children}

      </LineChart>
    </ChartContainer>
  );
}
