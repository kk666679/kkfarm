import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { SEMANTIC_COLORS } from '../theme';

export interface CohortRow {
  /** Cohort label, e.g. "Week of Jan 8". */
  cohort: string;
  /** Retention values (0-100) at each period (offset 0..N). */
  values: number[];
}

interface CohortRetentionChartProps {
  rows: CohortRow[];
  /** Period labels, e.g. ['W0', 'W1', 'W2', ...]. */
  periods: string[];
  ariaLabel: string;
  className?: string;
  cellSize?: number;
}

/**
 * Custom SVG cohort retention matrix.
 *
 * Recharts has no cohort primitive. Rows = cohorts, columns = periods,
 * cell color intensity = retention percentage. Cheap and screen-reader
 * friendly via the paired hidden table.
 */
export function CohortRetentionChart({
  rows,
  periods,
  ariaLabel,
  className,
  cellSize = 36,
}: CohortRetentionChartProps) {
  const max = useMemo(
    () => Math.max(1, ...rows.flatMap(r => r.values)),
    [rows]
  );

  if (rows.length === 0) return null;

  return (
    <div className={cn('overflow-x-auto', className)} role="img" aria-label={ariaLabel}>
      <div
        className="inline-grid gap-px"
        style={{ gridTemplateColumns: `120px repeat(${periods.length}, ${cellSize}px)` }}
      >
        <div aria-hidden="true" />
        {periods.map(p => (
          <div
            key={`h-${p}`}
            className="pb-1 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
          >
            {p}
          </div>
        ))}

        {rows.map(r => (
          <div key={r.cohort} className="contents">
            <div className="flex items-center pr-2 text-xs text-muted-foreground">
              <span className="truncate" title={r.cohort}>{r.cohort}</span>
            </div>
            {periods.map((_, i) => {
              const v = r.values[i];
              const defined = typeof v === 'number';
              const t = defined ? v / max : 0;
              return (
                <div
                  key={`${r.cohort}-${i}`}
                  title={defined ? `${r.cohort} · ${periods[i]}: ${v.toFixed(1)}%` : `${periods[i]}: —`}
                  className="flex items-center justify-center rounded-sm text-[10px] font-medium text-white"
                  style={{
                    width: cellSize,
                    height: cellSize,
                    background: defined
                      ? SEMANTIC_COLORS.primary
                      : 'var(--muted, #e2e8f0)',
                    opacity: defined ? 0.15 + t * 0.85 : 1,
                  }}
                >
                  {defined ? `${Math.round(v)}%` : ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
