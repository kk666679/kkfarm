import { ComposedChartBase } from '../base';
import { makeTimeAxisFormatter } from '../format';
import { SEMANTIC_COLORS } from '../theme';
import { ChartEmptyState } from '../primitives';

export interface ThroughputPoint {
  t: string;
  completed: number;
  started: number;
}

interface ThroughputChartProps {
  data: ThroughputPoint[];
  height?: number;
  className?: string;
}

export function ThroughputChart({ data, height = 240, className }: ThroughputChartProps) {
  if (data.length === 0) {
    return <ChartEmptyState height={height} message="No throughput data." className={className} />;
  }

  const xFormatter = makeTimeAxisFormatter(data.map(d => d.t));

  return (
    <ComposedChartBase
      data={data}
      xKey="t"
      height={height}
      className={className}
      ariaLabel="Task throughput"
      ariaDescription="Bars show tasks completed per interval, line shows tasks started."
      xTickFormatter={xFormatter}
      series={[
        { dataKey: 'completed', type: 'bar', label: 'Completed', color: SEMANTIC_COLORS.success },
        { dataKey: 'started', type: 'line', label: 'Started', color: SEMANTIC_COLORS.primary },
      ]}
    />
  );
}
