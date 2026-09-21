import { ComposedChartBase } from '../base';
import { makeTimeAxisFormatter } from '../format';
import { SEMANTIC_COLORS } from '../theme';
import { ChartEmptyState } from '../primitives';

export interface StreamingHealthPoint {
  t: string;
  /** Frames per second. Target ~30 or 60. */
  fps: number;
  /** Bitrate in kbps. */
  bitrateKbps: number;
  /** Dropped frames count for this interval. */
  droppedFrames: number;
}

interface StreamingHealthChartProps {
  data: StreamingHealthPoint[];
  height?: number;
  className?: string;
  /** Reference FPS target. */
  targetFps?: number;
}

export function StreamingHealthChart({
  data,
  height = 240,
  className,
}: StreamingHealthChartProps) {
  if (data.length === 0) {
    return <ChartEmptyState height={height} message="No streaming data." className={className} />;
  }

  const xFormatter = makeTimeAxisFormatter(data.map(d => d.t));

  return (
    <ComposedChartBase
      data={data}
      xKey="t"
      height={height}
      className={className}
      ariaLabel="Streaming quality"
      ariaDescription="FPS, bitrate, and dropped frames over time."
      xTickFormatter={xFormatter}
      yTickFormatter={v => String(Math.round(v))}
      secondaryYAxis={{
        yAxisId: 'right',
        orientation: 'right',
        tickFormatter: v => `${Math.round(v)} kbps`,
      }}
      series={[
        { dataKey: 'fps', type: 'line', label: 'FPS', color: SEMANTIC_COLORS.success },
        {
          dataKey: 'bitrateKbps',
          type: 'area',
          label: 'Bitrate',
          color: SEMANTIC_COLORS.primary,
          yAxisId: 'right',
          fillOpacity: 0.15,
        },
        { dataKey: 'droppedFrames', type: 'bar', label: 'Dropped', color: SEMANTIC_COLORS.danger },
      ]}
    />
  );
}
