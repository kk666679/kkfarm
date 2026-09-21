import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveHeaderProps {
  children: ReactNode;
  className?: string;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  spacing?: 'sm' | 'md' | 'lg';
}

/**
 * Responsive page header
 * - Title: fluid-4xl on desktop, fluid-3xl on tablet, fluid-2xl on mobile
 * - Stacks vertically on mobile, horizontally on desktop
 * - Maintains hierarchy and spacing across all viewports
 */
export function ResponsiveHeader({
  children,
  className,
  title,
  description,
  action,
  spacing = 'md',
}: ResponsiveHeaderProps) {
  const spacingMap = {
    sm: 'py-fluid-3',
    md: 'py-fluid-4',
    lg: 'py-fluid-6',
  };

  return (
    <div className={cn('w-full space-y-fluid-2', spacingMap[spacing], className)}>
      {children || (
        <>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-fluid-3">
            <div className="flex-1 min-w-0">
              {title && (
                <h1 className="text-fluid-4xl md:text-fluid-5xl font-bold tracking-tight truncate">
                  {title}
                </h1>
              )}
              {description && (
                <p className="text-fluid-base md:text-fluid-lg text-muted-foreground mt-fluid-1">
                  {description}
                </p>
              )}
            </div>
            {action && <div className="flex-shrink-0 w-full md:w-auto">{action}</div>}
          </div>
        </>
      )}
    </div>
  );
}
