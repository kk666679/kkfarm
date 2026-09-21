import { Brush } from 'recharts';
import { SEMANTIC_COLORS } from '../theme';

interface ChartBrushProps {
  /** Data key used for the brush axis. Should match the chart's xKey. */
  dataKey: string;
  height?: number;
  /** Optional ISO timestamps for the drag handles. */
  tickFormatter?: (v: string) => string;
}

/**
 * Brush — adds drag-to-zoom on the x-axis of a Line/Area/Bar/Composed chart.
 * Render as the LAST child of the chart component.
 */
export function ChartBrush({ dataKey, height = 24, tickFormatter }: ChartBrushProps) {
  return (
    <Brush
      dataKey={dataKey}
      height={height}
      travellerWidth={8}
      stroke={SEMANTIC_COLORS.primary}
      fill="var(--muted, #e2e8f0)"
      tickFormatter={tickFormatter ? v => tickFormatter(String(v)) : undefined}
      aria-label="Chart zoom range"
    />
  );
}
