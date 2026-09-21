import { ReferenceArea, ReferenceDot, ReferenceLine } from 'recharts';
import { SEMANTIC_COLORS } from '../theme';

export interface RefLineSpec {
  /** Horizontal line at a y-value. */
  y?: number;
  /** Vertical line at an x-value. */
  x?: string | number;
  label?: string;
  color?: string;
  strokeDasharray?: string;
  yAxisId?: string;
}

export interface RefAreaSpec {
  x1?: string | number;
  x2?: string | number;
  y1?: number;
  y2?: number;
  label?: string;
  color?: string;
  fillOpacity?: number;
  yAxisId?: string;
}

export interface RefDotSpec {
  x: string | number;
  y: number;
  label?: string;
  color?: string;
  r?: number;
  yAxisId?: string;
}

interface ReferenceLinesProps {
  lines?: RefLineSpec[];
  areas?: RefAreaSpec[];
  dots?: RefDotSpec[];
}

/**
 * Reference overlays — SLO thresholds, incident windows, notable events.
 * Render as children of any cartesian chart.
 */
export function ReferenceLines({ lines = [], areas = [], dots = [] }: ReferenceLinesProps) {
  return (
    <>
      {areas.map((a, i) => (
        <ReferenceArea
          key={`area-${i}`}
          x1={a.x1}
          x2={a.x2}
          y1={a.y1}
          y2={a.y2}
          yAxisId={a.yAxisId}
          fill={a.color ?? SEMANTIC_COLORS.warning}
          fillOpacity={a.fillOpacity ?? 0.08}
          stroke="none"
          label={
            a.label
              ? {
                  value: a.label,
                  position: 'insideTopLeft',
                  fontSize: 10,
                  fill: SEMANTIC_COLORS.muted,
                }
              : undefined
          }
        />
      ))}
      {lines.map((l, i) => (
        <ReferenceLine
          key={`line-${i}`}
          y={l.y}
          x={l.x}
          yAxisId={l.yAxisId}
          stroke={l.color ?? SEMANTIC_COLORS.danger}
          strokeDasharray={l.strokeDasharray ?? '4 4'}
          strokeWidth={1}
          label={
            l.label
              ? {
                  value: l.label,
                  position: l.y !== undefined ? 'right' : 'top',
                  fontSize: 10,
                  fill: l.color ?? SEMANTIC_COLORS.danger,
                }
              : undefined
          }
        />
      ))}
      {dots.map((d, i) => (
        <ReferenceDot
          key={`dot-${i}`}
          x={d.x}
          y={d.y}
          yAxisId={d.yAxisId}
          r={d.r ?? 4}
          fill={d.color ?? SEMANTIC_COLORS.danger}
          stroke="var(--background)"
          strokeWidth={2}
          label={
            d.label
              ? { value: d.label, position: 'top', fontSize: 10, fill: d.color ?? SEMANTIC_COLORS.danger }
              : undefined
          }
        />
      ))}
    </>
  );
}
