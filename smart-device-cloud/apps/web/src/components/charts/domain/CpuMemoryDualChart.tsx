import { ComposedChartBase } from '../base';
import { makeTimeAxisFormatter, formatBytes, formatPercent } from '../format';
import { SEMANTIC_COLORS } from '../theme';
import { ChartEmptyState } from '../primitives';

export interface CpuMemoryPoint {
  t: string;
  /** CPU as a percentage (0–100). */
  cpu: number;
  /** Memory in bytes. */
  memory: number;
}

interface CpuMemoryDualChartProps {
  data: CpuMemoryPoint[];
  height?: number;
  className?: string;
}

/**
 * CPU (left axis, %) and Memory (right axis, bytes) plotted together.
 * Uses ComposedChartBase's secondaryYAxis support.
 */
export function CpuMemoryDualChart({
  data,
  height = 260,
  className,
}: CpuMemoryDualChartProps) {
  if (data.length === 0) {
    return <ChartEmptyState height={height} message="No resource data." className={className} />;
  }

  const xFormatter = makeTimeAxisFormatter(data.map(d => d.t));

  return (
    <ComposedChartBase
      data={data}
      xKey="t"
      height={height}
      className={className}
      ariaLabel="CPU and memory utilization"
      ariaDescription="CPU percentage on the left axis, memory usage on the right."
      xTickFormatter={xFormatter}
      yTickFormatter={v => formatPercent(v, 0)}
      secondaryYAxis={{
        yAxisId: 'right',
        orientation: 'right',
        tickFormatter: v => formatBytes(v),
      }}
      series={[
        {
          dataKey: 'cpu',
          type: 'area',
          label: 'CPU',
          color: SEMANTIC_COLORS.primary,
          fillOpacity: 0.2,
        },
        {
          dataKey: 'memory',
          type: 'line',
          label: 'Memory',
          color: SEMANTIC_COLORS.accent,
          yAxisId: 'right',
        },
      ]}
    />
  );
}
