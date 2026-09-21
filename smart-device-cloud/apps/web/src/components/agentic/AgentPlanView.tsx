import {
  CheckCircle2,
  Circle,
  Loader2,
  ShieldCheck,
  SkipForward,
  XCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AgentPlanStep } from './types';

const STATUS_ICON: Record<
  AgentPlanStep['status'],
  { icon: LucideIcon; className: string }
> = {
  pending: { icon: Circle, className: 'text-muted-foreground' },
  running: { icon: Loader2, className: 'text-primary animate-spin' },
  completed: { icon: CheckCircle2, className: 'text-emerald-600 dark:text-emerald-400' },
  failed: { icon: XCircle, className: 'text-destructive' },
  skipped: { icon: SkipForward, className: 'text-muted-foreground' },
};

function fmtDuration(ms: number): string {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

interface AgentPlanViewProps {
  title: string;
  steps: AgentPlanStep[];
  requiresApproval?: boolean;
  totalDurationMs?: number;
  /** Optional footer actions. */
  actions?: React.ReactNode;
  className?: string;
}

export function AgentPlanView({
  title,
  steps,
  requiresApproval,
  totalDurationMs,
  actions,
  className,
}: AgentPlanViewProps) {
  return (
    <div className={cn('rounded-lg border border-border bg-card', className)}>
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-foreground">
            {title}
          </div>
          <div className="text-xs text-muted-foreground">
            {steps.length} step{steps.length === 1 ? '' : 's'}
            {totalDurationMs !== undefined && ` · ~${fmtDuration(totalDurationMs)}`}
          </div>
        </div>
        {requiresApproval && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
            <ShieldCheck className="h-3 w-3" aria-hidden="true" />
            Approval required
          </span>
        )}
      </div>

      <ol role="list" className="divide-y divide-border">
        {steps.map((step, i) => {
          const cfg = STATUS_ICON[step.status];
          const Icon = cfg.icon;
          return (
            <li key={step.id} className="flex gap-3 px-3 py-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-xs tabular-nums text-muted-foreground">
                {i + 1}
              </span>
              <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', cfg.className)} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="text-sm text-foreground">{step.label}</div>
                {step.description && (
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {step.description}
                  </div>
                )}
                {step.error && (
                  <div className="mt-0.5 text-xs text-destructive">{step.error}</div>
                )}
                {step.tool && (
                  <div className="mt-1 inline-flex rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    {step.tool}
                  </div>
                )}
              </div>
              {step.durationMs !== undefined && (
                <span className="shrink-0 self-start text-[10px] tabular-nums text-muted-foreground">
                  {fmtDuration(step.durationMs)}
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {actions && (
        <div className="flex items-center justify-end gap-2 border-t border-border px-3 py-2">
          {actions}
        </div>
      )}
    </div>
  );
}
