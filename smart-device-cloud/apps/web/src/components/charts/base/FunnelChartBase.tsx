import { Funnel, FunnelChart, LabelList, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltip } from '../primitives';
import { CHART_PALETTE, DEFAULT_CHART_HEIGHT, prefersReducedMotion } from '../theme';

export interface FunnelStage {
  name: string;
  value: number;
  fill?: string;
}

interface FunnelChartBaseProps {
  data: FunnelStage[];
  height?: number;
  ariaLabel: string;
  ariaDescription?: string;
  className?: string;
  showConversion?: boolean;
}

export function FunnelChartBase({
  data,
  height = DEFAULT_CHART_HEIGHT,
  ariaLabel,
  ariaDescription,
  className,
  showConversion = true,
}: FunnelChartBaseProps) {
  const noAnim = prefersReducedMotion();
  const first = data[0]?.value ?? 1;
  const colored = data.map((stage, i) => ({
    ...stage,
    fill: stage.fill ?? CHART_PALETTE[i % CHART_PALETTE.length],
  }));

  return (
    <ChartContainer
      ariaLabel={ariaLabel}
      ariaDescription={ariaDescription}
      height={height}
      className={className}
    >
      <FunnelChart>
        <Tooltip content={<ChartTooltip />} />
        <Funnel dataKey="value" data={colored} isAnimationActive={!noAnim}>
          <LabelList
            position="right"
            fill="var(--foreground, #0f172a)"
            stroke="none"
            dataKey="name"
            fontSize={12}
          />
          {showConversion && (
            <LabelList
              position="center"
              fill="#fff"
              stroke="none"
              fontSize={11}
              formatter={(value) => {
                const n = typeof value === 'number' ? value : Number(value) || 0;
                return `${((n / first) * 100).toFixed(0)}%`;
              }}
            />
          )}
        </Funnel>
      </FunnelChart>
    </ChartContainer>
  );
}
