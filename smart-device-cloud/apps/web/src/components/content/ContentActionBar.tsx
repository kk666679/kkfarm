import { CheckCircle2, Calendar, Copy, Trash2, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContentActionBarProps {
  count: number;
  onClear: () => void;
  onApprove?: () => void;
  onSchedule?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  floating?: boolean;
  className?: string;
}

interface ActionSpec {
  key: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  destructive?: boolean;
  iconOnly?: boolean;
}

export function ContentActionBar({ count, onClear, onApprove, onSchedule, onDuplicate, onDelete, floating = true, className }: ContentActionBarProps) {
  if (count === 0) return null;

  const actions: ActionSpec[] = [];
  if (onApprove) actions.push({ key: 'approve', label: 'Approve', icon: CheckCircle2, onClick: onApprove });
  if (onSchedule) actions.push({ key: 'schedule', label: 'Schedule', icon: Calendar, onClick: onSchedule });
  if (onDuplicate) actions.push({ key: 'duplicate', label: 'Duplicate', icon: Copy, onClick: onDuplicate });
  if (onDelete) actions.push({ key: 'delete', label: 'Delete', icon: Trash2, onClick: onDelete, destructive: true });
  actions.push({ key: 'clear', label: 'Clear selection', icon: X, onClick: onClear, iconOnly: true });

  return (
    <div role="region" aria-label="Content actions" className={cn('flex items-center gap-1', floating && 'sticky bottom-4 z-30 mx-auto w-fit rounded-full border border-border bg-card px-2 py-1.5 shadow-lg', className)}>
      <span className="px-3 text-sm font-medium text-foreground">{count} selected</span>
      {actions.map(a => {
        const Icon = a.icon;
        return (
          <button key={a.key} type="button" onClick={a.onClick} aria-label={a.iconOnly ? a.label : undefined} className={cn('inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors', 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', a.destructive ? 'text-destructive hover:bg-destructive/10' : 'text-foreground hover:bg-muted', a.iconOnly && 'px-1.5')}>
            <Icon className="h-4 w-4" aria-hidden="true" />
            {!a.iconOnly && a.label}
          </button>
        );
      })}
    </div>
  );
}
