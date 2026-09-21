import {
  CartesianGrid,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import { ChartContainer, ChartTooltip } from '../primitives';
import {
  AXIS_STYLE,
  CHART_PALETTE,
  DEFAULT_CHART_HEIGHT,
  GRID_STYLE,
} from '../theme';
import { formatCompactNumber } from '../format';

export interface ScatterSeries {
  name: string;
  color?: string;
  data: Array<{ x: number; y: number; z?: number; meta?: Record<string, unknown> }>;
}

interface ScatterChartBaseProps {
  series: ScatterSeries[];
  xLabel?: string;
  yLabel?: string;
  height?: number;
  ariaLabel: string;
  ariaDescription?: string;
  className?: string;
  xTickFormatter?: (v: number) => string;
  yTickFormatter?: (v: number) => string;
}

export function ScatterChartBase({
  series,
  xLabel,
  yLabel,
  height = DEFAULT_CHART_HEIGHT,
  ariaLabel,
  ariaDescription,
  className,
  xTickFormatter,
  yTickFormatter,
}: ScatterChartBaseProps) {
  return (
    <ChartContainer
      ariaLabel={ariaLabel}
      ariaDescription={ariaDescription}
      height={height}
      className={className}
    >
      <ScatterChart margin={{ top: 8, right: 12, left: 0, bottom: 16 }}>
        <CartesianGrid {...GRID_STYLE} vertical />
        <XAxis
          type="number"
          dataKey="x"
          name={xLabel}
          tick={AXIS_STYLE}
          tickLine={false}
          axisLine={false}
          tickFormatter={xTickFormatter ?? formatCompactNumber}
          label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -8, style: AXIS_STYLE } : undefined}
        />
        <YAxis
          type="number"
          dataKey="y"
          name={yLabel}
          tick={AXIS_STYLE}
          tickLine={false}
          axisLine={false}
          tickFormatter={yTickFormatter ?? formatCompactNumber}
          width={48}
          label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', style: AXIS_STYLE } : undefined}
        />
        <ZAxis type="number" dataKey="z" range={[40, 400]} />
        <Tooltip content={<ChartTooltip />} cursor={{ strokeDasharray: '3 3' }} />
        {series.map((s, i) => (
          <Scatter
            key={s.name}
            name={s.name}
            data={s.data}
            fill={s.color ?? CHART_PALETTE[i % CHART_PALETTE.length]}
            fillOpacity={0.75}
          />
        ))}
      </ScatterChart>
    </ChartContainer>
  );
}
