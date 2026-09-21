import { LineChartBase } from '../base';
import { makeTimeAxisFormatter, formatDuration } from '../format';
import { SEMANTIC_COLORS } from '../theme';
import { ChartEmptyState } from '../primitives';
import { ReferenceLines } from '../features';

export interface ApiLatencyPoint {
  t: string;
  p50: number;
  p95: number;
  p99: number;
}

interface ApiLatencyChartProps {
  data: ApiLatencyPoint[];
  /** Optional SLO in ms. Draws a horizontal reference line at that value. */
  sloMs?: number;
  height?: number;
  className?: string;
}

export function ApiLatencyChart({
  data,
  sloMs = 500,
  height = 260,
  className,
}: ApiLatencyChartProps) {
  if (data.length === 0) {
    return <ChartEmptyState height={height} message="No API latency data." className={className} />;
  }

  const xFormatter = makeTimeAxisFormatter(data.map(d => d.t));

  return (
    <LineChartBase
      data={data}
      xKey="t"
      height={height}
      className={className}
      ariaLabel="API latency percentiles"
      ariaDescription="Line chart showing API p50, p95, and p99 latency in milliseconds."
      xTickFormatter={xFormatter}
      yTickFormatter={v => formatDuration(v)}
      series={[
        { dataKey: 'p50', label: 'p50', color: SEMANTIC_COLORS.success },
        { dataKey: 'p95', label: 'p95', color: SEMANTIC_COLORS.warning },
        { dataKey: 'p99', label: 'p99', color: SEMANTIC_COLORS.danger },
      ]}
    >
      <ReferenceLines
        lines={[
          { y: sloMs, label: `SLO ${formatDuration(sloMs)}`, color: SEMANTIC_COLORS.danger },
        ]}
      />
    </LineChartBase>
  );
}
