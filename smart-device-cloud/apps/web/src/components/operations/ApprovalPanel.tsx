import { AlertTriangle, CheckCircle2, Clock, Cpu, ShieldCheck, User, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { SurfaceApprovalProposal } from '@/types/agent-surface';

interface ApprovalPanelProps {
  proposal: SurfaceApprovalProposal;
  onApprove?: () => void;
  onReject?: (reason?: string) => void;
  onModify?: () => void;
  busy?: boolean;
  className?: string;
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function ApprovalPanel({
  proposal,
  onApprove,
  onReject,
  onModify,
  busy = false,
  className,
}: ApprovalPanelProps) {
  const isAgent = proposal.requestedBy.kind === 'agent';
  const RequestIcon = isAgent ? Cpu : User;

  return (
    <Card className={cn('border-l-4 border-l-amber-500', className)}>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <CardTitle className="text-base">Approval required</CardTitle>
          </div>
          <span className="inline-flex items-center gap-1 rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">
            <RequestIcon className="h-3 w-3" aria-hidden="true" />
            {proposal.requestedBy.name}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <div className="text-sm font-medium text-foreground">{proposal.action}</div>
          <p className="mt-1 text-sm text-muted-foreground">{proposal.impactSummary}</p>
        </div>

        <Separator />

        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Targets
            </dt>
            <dd className="mt-0.5 text-sm text-foreground">
              {proposal.targetDeviceIds.length} device
              {proposal.targetDeviceIds.length === 1 ? '' : 's'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Requested
            </dt>
            <dd className="mt-0.5 text-sm text-foreground">{formatTime(proposal.requestedAt)}</dd>
          </div>
          {proposal.expiresAt && (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Expires
              </dt>
              <dd className="mt-0.5 flex items-center gap-1 text-sm text-foreground">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {formatTime(proposal.expiresAt)}
              </dd>
            </div>
          )}
        </dl>

        {Object.keys(proposal.parameters).length > 0 && (
          <>
            <Separator />
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Parameters
              </div>
              <pre className="overflow-x-auto rounded bg-muted/50 p-3 text-xs">
                {JSON.stringify(proposal.parameters, null, 2)}
              </pre>
            </div>
          </>
        )}

        <div className="flex items-start gap-2 rounded-md bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <p>
            This action will be authorized by the backend and recorded in the audit trail.
            Approval cannot be undone.
          </p>
        </div>

        <Separator />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onApprove}
            disabled={busy || !onApprove}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Approve
          </button>
          {onModify && (
            <button
              type="button"
              variant-ignore="true"
              onClick={onModify}
              disabled={busy}
              className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            >
              Modify scope
            </button>
          )}
          {onReject && (
            <button
              type="button"
              onClick={() => onReject()}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" aria-hidden="true" />
              Reject
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
