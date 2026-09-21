import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/common';
import { AgentActionProposal } from './AgentActionProposal';
import type { SurfaceApprovalProposal } from '@/types/agent-surface';

interface ApprovalInboxProps {
  proposals: SurfaceApprovalProposal[];
  onApprove: (id: string) => void | Promise<void>;
  onReject: (id: string, reason?: string) => void | Promise<void>;
  onModify?: (id: string) => void;
  className?: string;
}

export function ApprovalInbox({
  proposals,
  onApprove,
  onReject,
  onModify,
  className,
}: ApprovalInboxProps) {
  const [busyId, setBusyId] = useState<string | null>(null);

  if (proposals.length === 0) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="No pending approvals"
        description="AI-proposed actions that need human review will appear here."
        className={className}
      />
    );
  }

  const handle = async (id: string, fn: () => void | Promise<void>) => {
    setBusyId(id);
    try {
      await fn();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <ul role="list" className={cn('space-y-3', className)}>
      {proposals.map(p => (
        <li key={p.id}>
          <AgentActionProposal
            proposal={p}
            busy={busyId === p.id}
            onApprove={() => handle(p.id, () => onApprove(p.id))}
            onReject={() => handle(p.id, () => onReject(p.id))}
            onModify={onModify ? () => onModify(p.id) : undefined}
          />
        </li>
      ))}
    </ul>
  );
}
