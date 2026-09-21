import { StackedBarChart } from '../base';
import { makeTimeAxisFormatter } from '../format';
import { SEMANTIC_COLORS } from '../theme';
import { ChartEmptyState } from '../primitives';

export interface AlertTrendPoint {
  t: string;
  info: number;
  warning: number;
  critical: number;
}

interface AlertTrendChartProps {
  data: AlertTrendPoint[];
  height?: number;
  className?: string;
}

export function AlertTrendChart({ data, height = 220, className }: AlertTrendChartProps) {
  if (data.length === 0) {
    return <ChartEmptyState height={height} message="No alerts in this range." className={className} />;
  }

  const xFormatter = makeTimeAxisFormatter(data.map(d => d.t));

  return (
    <StackedBarChart
      data={data}
      xKey="t"
      height={height}
      className={className}
      ariaLabel="Alerts over time"
      ariaDescription="Stacked bar chart of info, warning, and critical alerts."
      xTickFormatter={xFormatter}
      series={[
        { dataKey: 'info', label: 'Info', color: SEMANTIC_COLORS.info },
        { dataKey: 'warning', label: 'Warning', color: SEMANTIC_COLORS.warning },
        { dataKey: 'critical', label: 'Critical', color: SEMANTIC_COLORS.danger },
      ]}
    />
  );
}
