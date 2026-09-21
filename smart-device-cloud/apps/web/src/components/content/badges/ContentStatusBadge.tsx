import { CheckCircle2, Circle, Clock, Loader2, ShieldCheck, XCircle, Archive, AlertTriangle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ContentStatus } from '../types';

const MAP: Record<ContentStatus, { label: string; icon: LucideIcon; className: string }> = {
  draft: { label: 'Draft', icon: Circle, className: 'bg-muted text-muted-foreground' },
  'pending-approval': { label: 'Pending approval', icon: Clock, className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400' },
  approved: { label: 'Approved', icon: ShieldCheck, className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400' },
  scheduled: { label: 'Scheduled', icon: Clock, className: 'bg-primary/10 text-primary' },
  publishing: { label: 'Publishing', icon: Loader2, className: 'bg-primary/10 text-primary' },
  published: { label: 'Published', icon: CheckCircle2, className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
  failed: { label: 'Failed', icon: XCircle, className: 'bg-destructive/10 text-destructive' },
  archived: { label: 'Archived', icon: Archive, className: 'bg-muted text-muted-foreground' },
};

export function ContentStatusBadge({ status, className, showIcon = true }: { status: ContentStatus; className?: string; showIcon?: boolean }) {
  const spec = MAP[status] ?? { label: status, icon: AlertTriangle, className: 'bg-muted text-muted-foreground' };
  const Icon = spec.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium', spec.className, className)}>
      {showIcon && <Icon className={cn('h-3 w-3', status === 'publishing' && 'animate-spin')} aria-hidden="true" />}
      {spec.label}
    </span>
  );
}
