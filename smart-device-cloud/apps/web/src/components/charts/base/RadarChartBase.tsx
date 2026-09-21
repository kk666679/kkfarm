import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  Tooltip,
} from 'recharts';
import { ChartContainer, ChartTooltip } from '../primitives';
import { CHART_PALETTE, DEFAULT_CHART_HEIGHT, prefersReducedMotion } from '../theme';

export interface RadarSeries {
  dataKey: string;
  label?: string;
  color?: string;
  fillOpacity?: number;
}

interface RadarChartBaseProps {
  /** Each row is one axis; keys beyond `subjectKey` are series values. */
  data: Array<Record<string, string | number>>;
  /** Key containing the axis label. */
  subjectKey: string;
  series: RadarSeries[];
  height?: number;
  ariaLabel: string;
  ariaDescription?: string;
  className?: string;
  /** Max value across all series. If omitted, recharts auto-scales. */
  max?: number;
}

export function RadarChartBase({
  data,
  subjectKey,
  series,
  height = DEFAULT_CHART_HEIGHT,
  ariaLabel,
  ariaDescription,
  className,
  max,
}: RadarChartBaseProps) {
  const noAnim = prefersReducedMotion();

  return (
    <ChartContainer
      ariaLabel={ariaLabel}
      ariaDescription={ariaDescription}
      height={height}
      className={className}
    >
      <RadarChart data={data} outerRadius="75%">
        <PolarGrid stroke="var(--border, #e2e8f0)" />
        <PolarAngleAxis
          dataKey={subjectKey}
          tick={{ fontSize: 11, fill: 'var(--muted-foreground, #94a3b8)' }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={max ? [0, max] : undefined}
          tick={{ fontSize: 10, fill: 'var(--muted-foreground, #94a3b8)' }}
        />
        <Tooltip content={<ChartTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {series.map((s, i) => {
          const color = s.color ?? CHART_PALETTE[i % CHART_PALETTE.length];
          return (
            <Radar
              key={s.dataKey}
              name={s.label ?? s.dataKey}
              dataKey={s.dataKey}
              stroke={color}
              fill={color}
              fillOpacity={s.fillOpacity ?? 0.25}
              isAnimationActive={!noAnim}
            />
          );
        })}
      </RadarChart>
    </ChartContainer>
  );
}
