import { LineChartBase } from '../base';
import { makeTimeAxisFormatter, formatDuration } from '../format';
import { SEMANTIC_COLORS } from '../theme';
import { ChartEmptyState } from '../primitives';

export interface QueueLatencyPoint {
  t: string;
  p50: number;
  p95: number;
  p99?: number;
}

interface QueueLatencyChartProps {
  data: QueueLatencyPoint[];
  height?: number;
  className?: string;
}

export function QueueLatencyChart({ data, height = 220, className }: QueueLatencyChartProps) {
  if (data.length === 0) {
    return <ChartEmptyState height={height} message="No queue data." className={className} />;
  }

  const xFormatter = makeTimeAxisFormatter(data.map(d => d.t));

  return (
    <LineChartBase
      data={data}
      xKey="t"
      height={height}
      className={className}
      ariaLabel="Queue latency percentiles over time"
      ariaDescription="Line chart showing p50, p95, and p99 queue latency in milliseconds."
      xTickFormatter={xFormatter}
      yTickFormatter={v => formatDuration(v)}
      series={[
        { dataKey: 'p50', label: 'p50', color: SEMANTIC_COLORS.success },
        { dataKey: 'p95', label: 'p95', color: SEMANTIC_COLORS.warning },
        ...(data.some(d => d.p99 !== undefined)
          ? [{ dataKey: 'p99', label: 'p99', color: SEMANTIC_COLORS.danger }]
          : []),
      ]}
    />
  );
}
