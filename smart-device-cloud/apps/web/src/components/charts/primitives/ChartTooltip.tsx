import { cn } from '@/lib/utils';
import { formatCompactNumber } from '../format';

interface TooltipPayloadItem {
  color?: string;
  dataKey?: string | number;
  name?: string | number;
  value?: number | string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: unknown;
  /** Return null to hide a row. */
  formatter?: (value: number, key: string) => string | null;
  labelFormatter?: (label: unknown) => string;
  className?: string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
  className,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const heading = labelFormatter ? labelFormatter(label) : String(label ?? '');

  return (
    <div
      className={cn(
        'min-w-[140px] rounded-md border border-border bg-card px-3 py-2 text-xs shadow-md',
        className
      )}
    >
      {heading && <div className="mb-1 font-medium text-foreground">{heading}</div>}
      <ul role="list" className="space-y-0.5">
        {payload.map((p, i) => {
          const key = String(p.dataKey ?? p.name ?? i);
          const raw = typeof p.value === 'number' ? p.value : Number(p.value);
          const display = formatter ? formatter(raw, key) : formatCompactNumber(raw);
          if (display === null) return null;
          return (
            <li key={i} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: p.color ?? 'currentColor' }}
                  aria-hidden="true"
                />
                {p.name ?? key}
              </span>
              <span className="font-medium tabular-nums text-foreground">{display}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
