import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartContainer, ChartTooltip } from '../primitives';
import {
  AXIS_STYLE,
  CHART_PALETTE,
  DEFAULT_CHART_HEIGHT,
  GRID_STYLE,
  prefersReducedMotion,
} from '../theme';
import { formatCompactNumber } from '../format';

export type ComposedSeriesType = 'bar' | 'line' | 'area';

export interface ComposedSeries {
  dataKey: string;
  type: ComposedSeriesType;
  label?: string;
  color?: string;
  stackId?: string;
  yAxisId?: string;
  strokeWidth?: number;
  fillOpacity?: number;
  barRadius?: number;
}

interface ComposedChartBaseProps {
  data: ReadonlyArray<any>;
  xKey: string;
  series: ComposedSeries[];
  /** Optional second y-axis. Use with series that set `yAxisId`. */
  secondaryYAxis?: {
    yAxisId: string;
    orientation?: 'left' | 'right';
    tickFormatter?: (v: number) => string;
    width?: number;
  };
  height?: number;
  ariaLabel: string;
  ariaDescription?: string;
  className?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  xTickFormatter?: (v: string) => string;
  yTickFormatter?: (v: number) => string;
}

export function ComposedChartBase({
  data,
  xKey,
  series,
  secondaryYAxis,
  height = DEFAULT_CHART_HEIGHT,
  ariaLabel,
  ariaDescription,
  className,
  showLegend = true,
  showGrid = true,
  xTickFormatter,
  yTickFormatter,
}: ComposedChartBaseProps) {
  const noAnim = prefersReducedMotion();

  return (
    <ChartContainer
      ariaLabel={ariaLabel}
      ariaDescription={ariaDescription}
      height={height}
      className={className}
    >
      <ComposedChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        {showGrid && <CartesianGrid {...GRID_STYLE} />}
        <XAxis
          dataKey={xKey}
          tick={AXIS_STYLE}
          tickLine={false}
          axisLine={false}
          tickFormatter={xTickFormatter}
        />
        <YAxis
          yAxisId="left"
          tick={AXIS_STYLE}
          tickLine={false}
          axisLine={false}
          tickFormatter={yTickFormatter ?? formatCompactNumber}
          width={44}
        />
        {secondaryYAxis && (
          <YAxis
            yAxisId={secondaryYAxis.yAxisId}
            orientation={secondaryYAxis.orientation ?? 'right'}
            tick={AXIS_STYLE}
            tickLine={false}
            axisLine={false}
            tickFormatter={secondaryYAxis.tickFormatter ?? formatCompactNumber}
            width={secondaryYAxis.width ?? 44}
          />
        )}
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
          const yAxisId = s.yAxisId ?? 'left';
          const name = s.label ?? s.dataKey;
          if (s.type === 'bar') {
            return (
              <Bar
                key={s.dataKey}
                yAxisId={yAxisId}
                dataKey={s.dataKey}
                name={name}
                fill={color}
                stackId={s.stackId}
                radius={s.barRadius ?? 3}
                isAnimationActive={!noAnim}
              />
            );
          }
          if (s.type === 'area') {
            return (
              <Area
                key={s.dataKey}
                yAxisId={yAxisId}
                type="monotone"
                dataKey={s.dataKey}
                name={name}
                stroke={color}
                fill={color}
                fillOpacity={s.fillOpacity ?? 0.15}
                stackId={s.stackId}
                isAnimationActive={!noAnim}
                connectNulls
              />
            );
          }
          return (
            <Line
              key={s.dataKey}
              yAxisId={yAxisId}
              type="monotone"
              dataKey={s.dataKey}
              name={name}
              stroke={color}
              strokeWidth={s.strokeWidth ?? 2}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={!noAnim}
              connectNulls
            />
          );
        })}
      </ComposedChart>
    </ChartContainer>
  );
}
