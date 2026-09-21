import { LineChartBase } from '../base';
import { makeTimeAxisFormatter, formatDuration } from '../format';
import { CHART_PALETTE } from '../theme';
import { ChartEmptyState } from '../primitives';

export interface NetworkLatencyPoint {
  t: string;
  /** Latency in ms. */
  latency: number;
  /** Jitter in ms. */
  jitter?: number;
  /** Packet loss in %. */
  loss?: number;
}

interface NetworkLatencyChartProps {
  data: NetworkLatencyPoint[];
  height?: number;
  className?: string;
  /** Show jitter and loss as additional lines (on the same ms/percent axis). */
  showJitter?: boolean;
  showLoss?: boolean;
}

export function NetworkLatencyChart({
  data,
  height = 220,
  className,
  showJitter = true,
  showLoss = false,
}: NetworkLatencyChartProps) {
  if (data.length === 0) {
    return <ChartEmptyState height={height} message="No network data." className={className} />;
  }

  const xFormatter = makeTimeAxisFormatter(data.map(d => d.t));
  const series = [
    { dataKey: 'latency', label: 'Latency (ms)', color: CHART_PALETTE[0] },
    ...(showJitter ? [{ dataKey: 'jitter', label: 'Jitter (ms)', color: CHART_PALETTE[2] }] : []),
    ...(showLoss ? [{ dataKey: 'loss', label: 'Loss (%)', color: CHART_PALETTE[3] }] : []),
  ];

  return (
    <LineChartBase
      data={data}
      xKey="t"
      height={height}
      className={className}
      ariaLabel="Network latency over time"
      ariaDescription="Line chart of network latency, jitter, and packet loss."
      xTickFormatter={xFormatter}
      yTickFormatter={v => formatDuration(v)}
      series={series}
    />
  );
}
