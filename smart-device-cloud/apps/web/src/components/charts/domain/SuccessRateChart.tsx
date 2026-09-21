import { BarChartBase } from '../base';
import { formatPercent } from '../format';
import { SEMANTIC_COLORS } from '../theme';
import { ChartEmptyState } from '../primitives';

export interface SuccessRateRow {
  name: string;
  success: number;
  failure: number;
}

interface SuccessRateChartProps {
  data: SuccessRateRow[];
  height?: number;
  className?: string;
  ariaLabel?: string;
}

export function SuccessRateChart({
  data,
  height = 240,
  className,
  ariaLabel = 'Success rate by workflow',
}: SuccessRateChartProps) {
  if (data.length === 0) {
    return <ChartEmptyState height={height} message="No runs in range." className={className} />;
  }

  const normalized = data.map(d => {
    const total = d.success + d.failure || 1;
    return {
      name: d.name,
      success: (d.success / total) * 100,
      failure: (d.failure / total) * 100,
    };
  });

  return (
    <BarChartBase
      data={normalized}
      xKey="name"
      height={height}
      className={className}
      layout="vertical"
      ariaLabel={ariaLabel}
      ariaDescription="Horizontal stacked bar chart showing success and failure rates."
      yTickFormatter={v => formatPercent(v, 0)}
      series={[
        { dataKey: 'success', label: 'Success', color: SEMANTIC_COLORS.success },
        { dataKey: 'failure', label: 'Failure', color: SEMANTIC_COLORS.danger },
      ]}
    />
  );
}
