import { useMemo } from 'react';
import { BarChartBase } from '../base';
import { formatDuration } from '../format';
import { SEMANTIC_COLORS } from '../theme';
import { ChartEmptyState } from '../primitives';

interface TaskDurationHistogramProps {
  durationsMs: number[];
  buckets?: number;
  height?: number;
  className?: string;
}

export function TaskDurationHistogram({
  durationsMs,
  buckets = 12,
  height = 220,
  className,
}: TaskDurationHistogramProps) {
  const data = useMemo(() => {
    if (durationsMs.length === 0) return [];
    const min = Math.min(...durationsMs);
    const max = Math.max(...durationsMs);
    const span = max - min || 1;
    const step = span / buckets;

    const counts = new Array(buckets).fill(0);
    for (const d of durationsMs) {
      const idx = Math.min(buckets - 1, Math.floor((d - min) / step));
      counts[idx]++;
    }

    return counts.map((count, i) => {
      const lo = min + i * step;
      const hi = lo + step;
      return {
        bucket: `${formatDuration(lo)}–${formatDuration(hi)}`,
        count,
      };
    });
  }, [durationsMs, buckets]);

  if (data.length === 0) {
    return <ChartEmptyState height={height} message="No completed tasks in range." className={className} />;
  }

  return (
    <BarChartBase
      data={data}
      xKey="bucket"
      height={height}
      className={className}
      ariaLabel="Task duration distribution"
      ariaDescription="Histogram of task execution times."
      series={[{ dataKey: 'count', label: 'Tasks', color: SEMANTIC_COLORS.primary }]}
      barRadius={2}
    />
  );
}
