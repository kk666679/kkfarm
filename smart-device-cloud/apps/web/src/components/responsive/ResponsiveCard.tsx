import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ResponsiveCardProps {
  children: ReactNode;
  className?: string;
  title?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  compact?: boolean;
  interactive?: boolean;
}

/**
 * Responsive card component with adaptive padding and spacing
 * - Compact padding on mobile
 * - Standard padding on tablet
 * - Generous padding on desktop
 * - Optional interactive states for touch-friendly interaction
 */
export function ResponsiveCard({
  children,
  className,
  title,
  header,
  footer,
  compact = false,
  interactive = false,
}: ResponsiveCardProps) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all',
        interactive && 'hover:shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer',
        className
      )}
    >
      {header && (
        <CardHeader
          className={cn(
            'flex flex-row items-center justify-between',
            compact ? 'px-3 py-2 sm:px-4 sm:py-3' : 'px-4 py-3 sm:px-6 sm:py-4'
          )}
        >
          {header}
        </CardHeader>
      )}

      {title && (
        <CardHeader
          className={cn(compact ? 'px-3 py-2 sm:px-4 sm:py-3' : 'px-4 py-3 sm:px-6 sm:py-4')}
        >
          <CardTitle className={cn(compact ? 'text-sm sm:text-base' : 'text-base sm:text-lg')}>
            {title}
          </CardTitle>
        </CardHeader>
      )}

      <CardContent
        className={cn(compact ? 'px-3 py-2 sm:px-4 sm:py-3' : 'px-4 py-3 sm:px-6 sm:py-4')}
      >
        {children}
      </CardContent>

      {footer && (
        <div
          className={cn(
            'border-t',
            compact ? 'px-3 py-2 sm:px-4 sm:py-3' : 'px-4 py-3 sm:px-6 sm:py-4'
          )}
        >
          {footer}
        </div>
      )}
    </Card>
  );
}
