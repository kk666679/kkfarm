import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveTableProps {
  children: ReactNode;
  className?: string;
  responsive?: 'scroll' | 'stack' | 'condense';
}

/**
 * Responsive table wrapper with multiple strategies
 * - scroll: Horizontal scrolling on mobile (default)
 * - stack: Convert to card/list layout on mobile
 * - condense: Hide non-essential columns on mobile
 */
export function ResponsiveTable({
  children,
  className,
  responsive = 'scroll',
}: ResponsiveTableProps) {
  if (responsive === 'scroll') {
    return (
      <div
        className={cn('table-responsive', 'w-full overflow-x-auto rounded-lg border', className)}
        role="region"
        aria-label="Scrollable table"
      >
        <table className="w-full text-sm">{children}</table>
      </div>
    );
  }

  // For other strategies, just return the table with wrapper
  return (
    <div className={cn('w-full overflow-hidden rounded-lg border', className)}>
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

interface ResponsiveTableHeaderProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveTableHeader({ children, className }: ResponsiveTableHeaderProps) {
  return <thead className={cn('bg-muted/50 border-b', className)}>{children}</thead>;
}

interface ResponsiveTableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function ResponsiveTableRow({ children, className, onClick }: ResponsiveTableRowProps) {
  return (
    <tr
      className={cn(
        'border-b transition-colors hover:bg-muted/50',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </tr>
  );
}

interface ResponsiveTableCellProps {
  children: ReactNode;
  className?: string;
  header?: boolean;
  hidden?: boolean;
}

export function ResponsiveTableCell({
  children,
  className,
  header = false,
  hidden = false,
}: ResponsiveTableCellProps) {
  return (
    <td
      className={cn(
        'px-3 py-2 sm:px-4 sm:py-3',
        'text-xs sm:text-sm',
        header && 'font-semibold',
        hidden && 'hidden sm:table-cell',
        className
      )}
    >
      {children}
    </td>
  );
}
