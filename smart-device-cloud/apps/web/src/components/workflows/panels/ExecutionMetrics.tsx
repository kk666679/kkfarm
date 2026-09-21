'use client';
import { Clock, Coins, Zap, CheckCircle2, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

export interface ExecutionMetricsProps {
  durationMs: number;
  tokensUsed: number;
  costUsd: number;
  nodeCount: number;
  completedCount: number;
  failedCount: number;
}

export function ExecutionMetrics({
  durationMs,
  tokensUsed,
  costUsd,
  nodeCount,
  completedCount,
  failedCount,
}: ExecutionMetricsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <Metric
        icon={<Clock className="h-3.5 w-3.5" />}
        label="Duration"
        value={formatDuration(durationMs)}
      />
      <Metric
        icon={<Zap className="h-3.5 w-3.5" />}
        label="Nodes"
        value={`${completedCount}/${nodeCount}`}
      />
      <Metric
        icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
        label="Completed"
        value={String(completedCount)}
      />
      <Metric
        icon={<XCircle className="h-3.5 w-3.5 text-destructive" />}
        label="Failed"
        value={String(failedCount)}
      />
      <Metric
        icon={<Zap className="h-3.5 w-3.5" />}
        label="Tokens"
        value={tokensUsed.toLocaleString()}
      />
      <Metric
        icon={<Coins className="h-3.5 w-3.5" />}
        label="Cost"
        value={`$${costUsd.toFixed(4)}`}
      />
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="flex items-center gap-2 border-border bg-card p-3">
      <span className="text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold">{value}</p>
      </div>
    </Card>
  );
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${s % 60}s`;
}
