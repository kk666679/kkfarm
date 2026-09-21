import { cn } from '@/lib/utils';

interface AITokenBudgetProps {
  used: number;
  total: number;
  compact?: boolean;
  className?: string;
}

export function AITokenBudget({
  used,
  total,
  compact = false,
  className,
}: AITokenBudgetProps) {
  if (total <= 0) return null;
  const pct = Math.min(100, Math.max(0, (used / total) * 100));
  const tone =
    pct >= 90 ? 'bg-destructive' : pct >= 75 ? 'bg-amber-500' : 'bg-primary';

  if (compact) {
    return (
      <span className={cn('text-[10px] tabular-nums text-muted-foreground', className)}>
        {used.toLocaleString()} / {total.toLocaleString()}
      </span>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-baseline justify-between text-[10px] text-muted-foreground">
        <span>Token budget</span>
        <span className="tabular-nums">
          {used.toLocaleString()} / {total.toLocaleString()}
        </span>
      </div>
      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn('h-full transition-all', tone)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
