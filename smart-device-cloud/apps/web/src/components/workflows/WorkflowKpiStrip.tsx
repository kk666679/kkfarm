'use client';
import { Card } from '@/components/ui/card';
import { GitBranch, Play, CheckCircle2, XCircle } from 'lucide-react';

export interface WorkflowKpiStripProps {
  total: number;
  active: number;
  totalRuns: number;
  successRate: number;
}

export function WorkflowKpiStrip({ total, active, totalRuns, successRate }: WorkflowKpiStripProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Kpi icon={<GitBranch className="h-4 w-4" />} label="Total" value={String(total)} />
      <Kpi
        icon={<Play className="h-4 w-4 text-blue-500" />}
        label="Active"
        value={String(active)}
      />
      <Kpi
        icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
        label="Total Runs"
        value={totalRuns.toLocaleString()}
      />
      <Kpi
        icon={
          successRate >= 90 ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          ) : (
            <XCircle className="h-4 w-4 text-destructive" />
          )
        }
        label="Success Rate"
        value={`${Math.round(successRate)}%`}
      />
    </div>
  );
}

function Kpi({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="flex items-center gap-3 border-border bg-card p-3">
      <span className="text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate text-lg font-semibold">{value}</p>
      </div>
    </Card>
  );
}
