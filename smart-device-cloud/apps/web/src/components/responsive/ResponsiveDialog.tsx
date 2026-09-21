import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveDialogProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
  scrollable?: boolean;
  labelledById?: string;
  describedById?: string;
}

/**
 * Responsive dialog/modal wrapper
 * - Adapts width based on viewport
 * - Maintains safe margins on all devices
 * - sm: 320px max (small mobile)
 * - md: 480px max (mobile)
 * - lg: 640px max (tablet/desktop)
 * - full: full width with margins
 */
export function ResponsiveDialog({
  children,
  className,
  size = 'md',
  scrollable = true,
  labelledById,
  describedById,
}: ResponsiveDialogProps) {
  const sizeMap = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    full: 'max-w-full sm:max-w-2xl',
  };

  return (
    <div
      className={cn(
        'modal-responsive',
        sizeMap[size],
        scrollable && 'overflow-y-auto max-h-[90vh]',
        'bg-background rounded-lg shadow-lg',
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledById}
      aria-describedby={describedById}
    >
      {children}
    </div>
  );
}

interface ResponsiveDialogHeaderProps {
  children: ReactNode;
  className?: string;
  closeButton?: ReactNode;
}

export function ResponsiveDialogHeader({
  children,
  className,
  closeButton,
}: ResponsiveDialogHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-fluid-2',
        'border-b px-fluid-3 py-fluid-3 sm:px-fluid-4 sm:py-fluid-4',
        className
      )}
    >
      <div className="flex-1 min-w-0">{children}</div>
      {closeButton && <div className="flex-shrink-0">{closeButton}</div>}
    </div>
  );
}

interface ResponsiveDialogTitleProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveDialogTitle({ children, className }: ResponsiveDialogTitleProps) {
  return (
    <h2 className={cn('text-lg sm:text-xl font-semibold tracking-tight truncate', className)}>
      {children}
    </h2>
  );
}

interface ResponsiveDialogDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveDialogDescription({
  children,
  className,
}: ResponsiveDialogDescriptionProps) {
  return <p className={cn('text-sm text-muted-foreground mt-1', className)}>{children}</p>;
}

interface ResponsiveDialogContentProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveDialogContent({ children, className }: ResponsiveDialogContentProps) {
  return (
    <div className={cn('px-fluid-3 py-fluid-3 sm:px-fluid-4 sm:py-fluid-4', className)}>
      {children}
    </div>
  );
}

interface ResponsiveDialogFooterProps {
  children: ReactNode;
  className?: string;
  layout?: 'row' | 'col' | 'responsive';
}

export function ResponsiveDialogFooter({
  children,
  className,
  layout = 'responsive',
}: ResponsiveDialogFooterProps) {
  const layoutMap = {
    row: 'flex flex-row gap-fluid-2',
    col: 'flex flex-col gap-fluid-2',
    responsive: 'flex flex-col sm:flex-row gap-fluid-2 sm:justify-end',
  };

  return (
    <div
      className={cn(
        layoutMap[layout],
        'border-t px-fluid-3 py-fluid-3 sm:px-fluid-4 sm:py-fluid-4',
        className
      )}
    >
      {children}
    </div>
  );
}
