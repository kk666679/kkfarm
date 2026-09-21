import { cn } from '@/lib/utils';

export interface LegendEntry {
  label: string;
  color: string;
  value?: string | number;
  muted?: boolean;
}

interface ChartLegendProps {
  entries: LegendEntry[];
  className?: string;
  /** Render horizontal (default) or vertical. */
  orientation?: 'horizontal' | 'vertical';
}

export function ChartLegend({
  entries,
  className,
  orientation = 'horizontal',
}: ChartLegendProps) {
  return (
    <ul
      role="list"
      className={cn(
        'flex gap-3 text-xs',
        orientation === 'vertical' ? 'flex-col' : 'flex-wrap items-center',
        className
      )}
    >
      {entries.map(e => (
        <li key={e.label} className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-sm"
            style={{ background: e.color }}
            aria-hidden="true"
          />
          <span className={cn('text-muted-foreground', e.muted && 'opacity-50')}>
            {e.label}
          </span>
          {e.value !== undefined && (
            <span className="font-medium tabular-nums text-foreground">
              {e.value}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
