import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  description?: string;
  /** Right-aligned actions. */
  actions?: ReactNode;
  /** Small caption above the title — for grouping. */
  overline?: string;
  className?: string;
  /** Heading level. Default 2. */
  as?: 'h2' | 'h3' | 'h4';
}

export function SectionHeader({
  title,
  description,
  actions,
  overline,
  className,
  as: Tag = 'h2',
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between',
        className
      )}
    >
      <div className="min-w-0">
        {overline && (
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {overline}
          </div>
        )}
        <Tag className="text-lg font-semibold text-foreground">{title}</Tag>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
