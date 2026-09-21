import { CheckCircle2, XCircle, AlertTriangle, Cpu, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RelativeTime } from '@/components/common';
import type { SurfaceApprovalProposal } from '@/types/agent-surface';

interface AgentActionProposalProps {
  proposal: SurfaceApprovalProposal;
  onApprove?: () => void;
  onReject?: () => void;
  onModify?: () => void;
  busy?: boolean;
  className?: string;
}

export function AgentActionProposal({
  proposal,
  onApprove,
  onReject,
  onModify,
  busy,
  className,
}: AgentActionProposalProps) {
  const isAgent = proposal.requestedBy.kind === 'agent';
  const RequestIcon = isAgent ? Cpu : User;

  return (
    <div
      className={cn(
        'rounded-lg border border-l-4 border-border border-l-amber-500 bg-card',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <span className="truncate text-sm font-semibold text-foreground">
          {proposal.action}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
          <RequestIcon className="h-3 w-3" aria-hidden="true" />
          {proposal.requestedBy.name}
        </span>
      </div>

      <div className="px-3 py-2 space-y-2 text-xs">
        <p className="text-muted-foreground">{proposal.impactSummary}</p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
          <span>
            <span className="font-medium text-foreground">
              {proposal.targetDeviceIds.length}
            </span>{' '}
            target{proposal.targetDeviceIds.length === 1 ? '' : 's'}
          </span>
          <RelativeTime value={proposal.requestedAt} />
          {proposal.expiresAt && (
            <span className="text-amber-600 dark:text-amber-400">
              Expires <RelativeTime value={proposal.expiresAt} />
            </span>
          )}
        </div>

        <div className="flex items-start gap-1.5 rounded bg-amber-500/10 px-2 py-1.5 text-amber-700 dark:text-amber-400">
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
          <span>Backend will authorize. Action is recorded in the audit trail.</span>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-border px-3 py-2">
        {onModify && (
          <button
            type="button"
            onClick={onModify}
            disabled={busy}
            className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            Modify
          </button>
        )}
        {onReject && (
          <button
            type="button"
            onClick={onReject}
            disabled={busy}
            className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            <XCircle className="h-3 w-3" aria-hidden="true" />
            Reject
          </button>
        )}
        {onApprove && (
          <button
            type="button"
            onClick={onApprove}
            disabled={busy}
            className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
            Approve
          </button>
        )}
      </div>
    </div>
  );
}
