import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { SEMANTIC_COLORS } from '../theme';

export interface HeatmapCell {
  row: string;
  col: string;
  value: number;
}

interface HeatmapChartProps {
  data: HeatmapCell[];
  rows: string[];
  cols: string[];
  ariaLabel: string;
  className?: string;
  cellSize?: number;
  /** Value formatter for tooltips. */
  format?: (v: number) => string;
  /** Min/max for color scale. Defaults to data range. */
  domain?: [number, number];
}

/**
 * Custom SVG heatmap.
 *
 * Recharts has no native heatmap. This renders a lightweight grid where each
 * cell's opacity encodes its value. Cheap enough for hundreds of cells.
 */
export function HeatmapChart({
  data,
  rows,
  cols,
  ariaLabel,
  className,
  cellSize = 22,
  format = v => String(v),
  domain,
}: HeatmapChartProps) {
  const [min, max] = useMemo(() => {
    if (domain) return domain;
    if (data.length === 0) return [0, 1] as const;
    const values = data.map(d => d.value);
    return [Math.min(...values), Math.max(...values)] as const;
  }, [data, domain]);

  const cellMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const d of data) m.set(`${d.row}|${d.col}`, d.value);
    return m;
  }, [data]);

  const range = max - min || 1;

  return (
    <div
      className={cn('overflow-x-auto', className)}
      role="img"
      aria-label={ariaLabel}
    >
      <div
        className="inline-grid gap-px"
        style={{
          gridTemplateColumns: `auto repeat(${cols.length}, ${cellSize}px)`,
        }}
      >
        {/* Header row */}
        <div aria-hidden="true" />
        {cols.map(c => (
          <div
            key={`h-${c}`}
            className="truncate text-center text-[10px] text-muted-foreground"
            style={{ height: 20 }}
            title={c}
          >
            {c.length > 4 ? c.slice(0, 3) : c}
          </div>
        ))}

        {/* Rows */}
        {rows.map(r => (
          <div key={`row-${r}`} className="contents">
            <div
              className="flex items-center pr-2 text-[10px] text-muted-foreground"
              style={{ height: cellSize }}
              title={r}
            >
              <span className="truncate">{r}</span>
            </div>
            {cols.map(c => {
              const v = cellMap.get(`${r}|${c}`) ?? 0;
              const t = (v - min) / range;
              return (
                <div
                  key={`${r}-${c}`}
                  title={`${r} · ${c}: ${format(v)}`}
                  className="rounded-sm transition-opacity hover:opacity-80"
                  style={{
                    width: cellSize,
                    height: cellSize,
                    background: SEMANTIC_COLORS.primary,
                    opacity: 0.12 + t * 0.88,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
