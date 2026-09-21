import { AreaChartBase } from '../base';
import { makeTimeAxisFormatter } from '../format';
import { SEMANTIC_COLORS } from '../theme';
import { ChartEmptyState } from '../primitives';

export interface CostTrendPoint {
  t: string;
  cost: number;
  /** Optional projected or budgeted line. */
  budget?: number;
}

interface CostTrendChartProps {
  data: CostTrendPoint[];
  height?: number;
  className?: string;
  currency?: string;
}

export function CostTrendChart({
  data,
  height = 240,
  className,
  currency = '$',
}: CostTrendChartProps) {
  if (data.length === 0) {
    return <ChartEmptyState height={height} message="No cost data." className={className} />;
  }

  const xFormatter = makeTimeAxisFormatter(data.map(d => d.t));

  return (
    <AreaChartBase
      data={data}
      xKey="t"
      height={height}
      className={className}
      ariaLabel="Cost over time"
      ariaDescription="Area chart of accumulated cost per time bucket."
      xTickFormatter={xFormatter}
      yTickFormatter={v => `${currency}${v.toFixed(2)}`}
      series={[
        { dataKey: 'cost', label: 'Cost', color: SEMANTIC_COLORS.primary, fillOpacity: 0.2 },
        ...(data.some(d => d.budget !== undefined)
          ? [{ dataKey: 'budget', label: 'Budget', color: SEMANTIC_COLORS.muted, fillOpacity: 0.05 }]
          : []),
      ]}
    />
  );
}
