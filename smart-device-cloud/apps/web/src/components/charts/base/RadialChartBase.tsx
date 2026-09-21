import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  Tooltip,
} from 'recharts';
import { ChartContainer, ChartTooltip } from '../primitives';
import { SEMANTIC_COLORS, prefersReducedMotion } from '../theme';

interface RadialChartBaseProps {
  value: number;
  max?: number;
  label: string;
  color?: string;
  height?: number;
  ariaLabel: string;
  ariaDescription?: string;
  className?: string;
}

/** Single-value gauge. Value is clamped to [0, max]. */
export function RadialChartBase({
  value,
  max = 100,
  label,
  color = SEMANTIC_COLORS.primary,
  height = 200,
  ariaLabel,
  ariaDescription,
  className,
}: RadialChartBaseProps) {
  const noAnim = prefersReducedMotion();
  const clamped = Math.max(0, Math.min(max, value));
  const data = [{ name: label, value: clamped, fill: color }];

  return (
    <div className="relative">
      <ChartContainer
        ariaLabel={ariaLabel}
        ariaDescription={ariaDescription}
        height={height}
        className={className}
      >
        <RadialBarChart
          data={data}
          innerRadius="70%"
          outerRadius="100%"
          startAngle={210}
          endAngle={-30}
          barSize={12}
        >
          <PolarAngleAxis type="number" domain={[0, max]} tick={false} />
          <RadialBar
            dataKey="value"
            background={{ fill: 'var(--muted, #e2e8f0)' }}
            cornerRadius={6}
            isAnimationActive={!noAnim}
          />
          <Tooltip content={<ChartTooltip />} />
        </RadialBarChart>
      </ChartContainer>
      <div
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-4"
        aria-hidden="true"
      >
        <div className="text-2xl font-semibold tabular-nums text-foreground">
          {clamped.toFixed(0)}
        </div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
