import { LineChartBase } from '../base';
import { makeTimeAxisFormatter, formatPercent } from '../format';
import { CHART_PALETTE } from '../theme';
import { ChartEmptyState } from '../primitives';

export interface UtilizationPoint {
  t: string;
  cpu: number;
  memory: number;
  storage?: number;
  network?: number;
}

interface DeviceUtilizationChartProps {
  data: UtilizationPoint[];
  height?: number;
  className?: string;
  /** Optional subset of metrics to draw. Default: all present. */
  metrics?: Array<'cpu' | 'memory' | 'storage' | 'network'>;
}

const LABEL: Record<string, string> = {
  cpu: 'CPU',
  memory: 'Memory',
  storage: 'Storage',
  network: 'Network',
};

export function DeviceUtilizationChart({
  data,
  height = 260,
  className,
  metrics = ['cpu', 'memory'],
}: DeviceUtilizationChartProps) {
  if (data.length === 0) {
    return <ChartEmptyState height={height} message="No utilization data." className={className} />;
  }

  const xFormatter = makeTimeAxisFormatter(data.map(d => d.t));
  const series = metrics.map((m, i) => ({
    dataKey: m,
    label: LABEL[m],
    color: CHART_PALETTE[i % CHART_PALETTE.length],
  }));

  return (
    <LineChartBase
      data={data}
      xKey="t"
      height={height}
      className={className}
      ariaLabel="Device resource utilization"
      ariaDescription="Line chart of device resource utilization over time."
      xTickFormatter={xFormatter}
      yTickFormatter={v => formatPercent(v, 0)}
      series={series}
    />
  );
}
