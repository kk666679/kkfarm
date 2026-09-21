import { LineChartBase, type LineSeries } from '../base';
import { makeTimeAxisFormatter } from '../format';
import { CHART_PALETTE } from '../theme';
import { ChartEmptyState } from '../primitives';

export interface MetricSeriesSpec {
  dataKey: string;
  label?: string;
  color?: string;
}

interface MetricTimeSeriesProps {
  data: Array<Record<string, string | number | null>>;
  /** Column containing the ISO timestamp. */
  timeKey?: string;
  series: MetricSeriesSpec[];
  height?: number;
  className?: string;
  ariaLabel?: string;
  /** Y-axis formatter. Defaults to compact numbers. */
  yFormatter?: (v: number) => string;
}

/**
 * Generic metric time-series.
 *
 * Use when the caller has arbitrary metrics that don't map to a domain chart.
 * For domain concepts (queue latency, cost) prefer the dedicated components.
 */
export function MetricTimeSeries({
  data,
  timeKey = 't',
  series,
  height = 260,
  className,
  ariaLabel = 'Metric time series',
  yFormatter,
}: MetricTimeSeriesProps) {
  if (data.length === 0 || series.length === 0) {
    return <ChartEmptyState height={height} message="No data." className={className} />;
  }

  const xFormatter = makeTimeAxisFormatter(data.map(d => String(d[timeKey] ?? '')));
  const lineSeries: LineSeries[] = series.map((s, i) => ({
    dataKey: s.dataKey,
    label: s.label,
    color: s.color ?? CHART_PALETTE[i % CHART_PALETTE.length],
  }));

  return (
    <LineChartBase
      data={data}
      xKey={timeKey}
      height={height}
      className={className}
      ariaLabel={ariaLabel}
      xTickFormatter={xFormatter}
      yTickFormatter={yFormatter}
      series={lineSeries}
    />
  );
}
