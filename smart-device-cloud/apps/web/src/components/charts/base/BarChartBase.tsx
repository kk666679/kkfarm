import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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

export interface BarSeries {
  dataKey: string;
  label?: string;
  color?: string;
  stackId?: string;
}

interface BarChartBaseProps {
  data: ReadonlyArray<any>;
  xKey: string;
  series: BarSeries[];
  height?: number;
  ariaLabel: string;
  ariaDescription?: string;
  className?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  layout?: 'horizontal' | 'vertical';
  xTickFormatter?: (v: string) => string;
  yTickFormatter?: (v: number) => string;
  barRadius?: number;
}

export function BarChartBase({
  data,
  xKey,
  series,
  height = DEFAULT_CHART_HEIGHT,
  ariaLabel,
  ariaDescription,
  className,
  showLegend = true,
  showGrid = true,
  layout = 'horizontal',
  xTickFormatter,
  yTickFormatter,
  barRadius = 4,
}: BarChartBaseProps) {
  const noAnim = prefersReducedMotion();
  const isVertical = layout === 'vertical';

  return (
    <ChartContainer
      ariaLabel={ariaLabel}
      ariaDescription={ariaDescription}
      height={height}
      className={className}
    >
      <BarChart
        data={data}
        layout={layout}
        margin={{ top: 8, right: 12, left: isVertical ? 8 : 0, bottom: 0 }}
      >
        {showGrid && <CartesianGrid {...GRID_STYLE} horizontal={!isVertical} vertical={isVertical} />}
        {isVertical ? (
          <>
            <XAxis type="number" tick={AXIS_STYLE} tickLine={false} axisLine={false} tickFormatter={yTickFormatter ?? formatCompactNumber} />
            <YAxis type="category" dataKey={xKey} tick={AXIS_STYLE} tickLine={false} axisLine={false} width={100} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tick={AXIS_STYLE} tickLine={false} axisLine={false} tickFormatter={xTickFormatter} />
            <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} tickFormatter={yTickFormatter ?? formatCompactNumber} width={44} />
          </>
        )}
        <Tooltip
          content={<ChartTooltip />}
          cursor={{ fill: 'var(--muted)', fillOpacity: 0.3 }}
        />
        {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {series.map((s, i) => (
          <Bar
            key={s.dataKey}
            dataKey={s.dataKey}
            name={s.label ?? s.dataKey}
            fill={s.color ?? CHART_PALETTE[i % CHART_PALETTE.length]}
            stackId={s.stackId}
            radius={s.stackId ? 0 : barRadius}
            isAnimationActive={!noAnim}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}
