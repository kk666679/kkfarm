import { cn } from '@/lib/utils';

interface AgentMetricsProps {
  successRate?: number;
  avgDurationMs?: number;
  totalRuns?: number;
  totalCostUsd?: number;
  className?: string;
}

function fmtDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${Math.floor(s % 60)}s`;
}

export function AgentMetrics({
  successRate,
  avgDurationMs,
  totalRuns,
  totalCostUsd,
  className,
}: AgentMetricsProps) {
  const cells: Array<{ label: string; value: string }> = [];
  if (totalRuns !== undefined) cells.push({ label: 'Runs', value: String(totalRuns) });
  if (successRate !== undefined)
    cells.push({ label: 'Success', value: `${(successRate * 100).toFixed(1)}%` });
  if (avgDurationMs !== undefined)
    cells.push({ label: 'Avg duration', value: fmtDuration(avgDurationMs) });
  if (totalCostUsd !== undefined)
    cells.push({ label: 'Total cost', value: `$${totalCostUsd.toFixed(2)}` });

  if (cells.length === 0) return null;

  return (
    <dl
      className={cn(
        'grid gap-3 rounded-lg border border-border bg-card p-3',
        cells.length === 1 && 'grid-cols-1',
        cells.length === 2 && 'grid-cols-2',
        cells.length >= 3 && 'grid-cols-2 sm:grid-cols-4',
        className
      )}
    >
      {cells.map(c => (
        <div key={c.label}>
          <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {c.label}
          </dt>
          <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
            {c.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
