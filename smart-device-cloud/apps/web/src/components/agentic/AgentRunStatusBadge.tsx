import {
  CheckCircle2,
  Clock,
  Loader2,
  ShieldCheck,
  XCircle,
  Circle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AgentRunStatus } from './types';

const MAP: Record<AgentRunStatus, { label: string; icon: LucideIcon; className: string }> = {
  pending: {
    label: 'Pending',
    icon: Circle,
    className: 'bg-muted text-muted-foreground',
  },
  running: {
    label: 'Running',
    icon: Loader2,
    className: 'bg-primary/10 text-primary',
  },
  'waiting-approval': {
    label: 'Waiting approval',
    icon: ShieldCheck,
    className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  },
  failed: {
    label: 'Failed',
    icon: XCircle,
    className: 'bg-destructive/10 text-destructive',
  },
  cancelled: {
    label: 'Cancelled',
    icon: Clock,
    className: 'bg-muted text-muted-foreground',
  },
};

interface AgentRunStatusBadgeProps {
  status: AgentRunStatus;
  className?: string;
  showIcon?: boolean;
}

export function AgentRunStatusBadge({
  status,
  className,
  showIcon = true,
}: AgentRunStatusBadgeProps) {
  const spec = MAP[status];
  const Icon = spec.icon;
  const spinning = status === 'running';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium',
        spec.className,
        className
      )}
    >
      {showIcon && (
        <Icon
          className={cn('h-3 w-3', spinning && 'animate-spin')}
          aria-hidden="true"
        />
      )}
      {spec.label}
    </span>
  );
}
