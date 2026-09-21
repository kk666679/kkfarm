import { Cell, Pie, PieChart, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltip } from '../primitives';
import { CHART_PALETTE, DEFAULT_CHART_HEIGHT, prefersReducedMotion } from '../theme';

export interface DonutSlice {
  name: string;
  value: number;
  color?: string;
}

interface DonutChartBaseProps {
  data: DonutSlice[];
  height?: number;
  ariaLabel: string;
  ariaDescription?: string;
  className?: string;
  innerRadius?: number;
  outerRadius?: number;
  /** Center content — e.g. total count. */
  centerLabel?: string;
  centerValue?: string | number;
}

export function DonutChartBase({
  data,
  height = DEFAULT_CHART_HEIGHT,
  ariaLabel,
  ariaDescription,
  className,
  innerRadius = 60,
  outerRadius = 90,
  centerLabel,
  centerValue,
}: DonutChartBaseProps) {
  const noAnim = prefersReducedMotion();

  return (
    <div className="relative">
      <ChartContainer
        ariaLabel={ariaLabel}
        ariaDescription={ariaDescription}
        height={height}
        className={className}
      >
        <PieChart>
          <Tooltip content={<ChartTooltip />} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
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

      {(centerLabel !== undefined || centerValue !== undefined) && (
        <div
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
          aria-hidden="true"
        >
          {centerValue !== undefined && (
            <div className="text-2xl font-semibold tabular-nums text-foreground">
              {centerValue}
            </div>
          )}
          {centerLabel && (
            <div className="text-xs text-muted-foreground">{centerLabel}</div>
          )}
        </div>
      )}
    </div>
  );
}
