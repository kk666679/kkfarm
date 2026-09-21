import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

type Size = 'sm' | 'md' | 'lg';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  size?: Size;
  className?: string;
  /** Optional override for the icon wrapper's background. */
  iconClassName?: string;
}

const SIZE: Record<Size, { pad: string; icon: string; title: string; desc: string; gap: string }> = {
  sm: { pad: 'px-4 py-8', icon: 'h-5 w-5', title: 'text-sm', desc: 'text-xs', gap: 'gap-3' },
  md: { pad: 'px-6 py-12', icon: 'h-6 w-6', title: 'text-base', desc: 'text-sm', gap: 'gap-4' },
  lg: { pad: 'px-8 py-20', icon: 'h-8 w-8', title: 'text-lg', desc: 'text-sm', gap: 'gap-5' },
};

/**
 * EmptyState — standard illustration-free empty surface.
 *
 * Distinct from:
 *   - data/EmptyState.tsx       (table-specific)
 *   - workflows/shared/EmptyState.tsx  (canvas-specific)
 *   - charts/.../ChartEmptyState.tsx   (chart-specific)
 *
 * Unifying these is a Phase 9 design-system task.
 */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  className,
  iconClassName,
}: EmptyStateProps) {
  const s = SIZE[size];
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 text-center',
        s.pad,
        s.gap,
        className
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-muted p-3',
          iconClassName
        )}
      >
        <Icon className={cn(s.icon, 'text-muted-foreground')} aria-hidden="true" />
      </div>

      <div className={cn('flex flex-col', s.gap)}>
        <h3 className={cn('font-semibold text-foreground', s.title)}>{title}</h3>
        {description && (
          <p className={cn('max-w-sm text-muted-foreground', s.desc)}>{description}</p>
        )}
      </div>

      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {action && (
            <button
              type="button"
              onClick={action.onClick}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                action.variant === 'secondary'
                  ? 'bg-muted text-foreground hover:bg-muted/80'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
