import { Cell, Legend, Pie, PieChart, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltip } from '../primitives';
import { CHART_PALETTE, DEFAULT_CHART_HEIGHT, prefersReducedMotion } from '../theme';

export interface PieSlice {
  name: string;
  value: number;
  color?: string;
}

interface PieChartBaseProps {
  data: PieSlice[];
  height?: number;
  ariaLabel: string;
  ariaDescription?: string;
  className?: string;
  outerRadius?: number;
  showLabels?: boolean;
  legendPosition?: 'right' | 'bottom' | 'top' | 'left';
}

export function PieChartBase({
  data,
  height = DEFAULT_CHART_HEIGHT,
  ariaLabel,
  ariaDescription,
  className,
  outerRadius = 100,
  showLabels = false,
  legendPosition = 'right',
}: PieChartBaseProps) {
  const noAnim = prefersReducedMotion();
  const legendProps =
    legendPosition === 'right'
      ? { layout: 'vertical' as const, align: 'right' as const, verticalAlign: 'middle' as const }
      : legendPosition === 'left'
        ? { layout: 'vertical' as const, align: 'left' as const, verticalAlign: 'middle' as const }
        : { layout: 'horizontal' as const, align: 'center' as const, verticalAlign: legendPosition === 'top' ? ('top' as const) : ('bottom' as const) };

  return (
    <ChartContainer
      ariaLabel={ariaLabel}
      ariaDescription={ariaDescription}
      height={height}
      className={className}
    >
      <PieChart>
        <Tooltip content={<ChartTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12 }} {...legendProps} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          outerRadius={outerRadius}
          label={
            showLabels
              ? (props: { name?: string; percent?: number }) => {
                  const pct = ((props.percent ?? 0) * 100).toFixed(0);
                  return `${props.name ?? ''} ${pct}%`;
                }
              : false
          }
          isAnimationActive={!noAnim}
        >
          {data.map((slice, i) => (
            <Cell
              key={slice.name}
              fill={slice.color ?? CHART_PALETTE[i % CHART_PALETTE.length]}
              stroke="var(--background)"
              strokeWidth={2}
            />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
