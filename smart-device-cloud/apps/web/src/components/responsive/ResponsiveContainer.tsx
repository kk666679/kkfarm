import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
}

/**
 * Responsive container with fluid padding and max-width
 * Handles safe-area insets on notched devices
 */
export function ResponsiveContainer({
  children,
  className,
  maxWidth = '3xl',
}: ResponsiveContainerProps) {
  return (
    <div
      className={cn(
        'w-full mx-auto container-responsive',
        {
          'container-sm': maxWidth === 'sm',
          'container-md': maxWidth === 'md',
          'container-lg': maxWidth === 'lg',
          'container-xl': maxWidth === 'xl',
          'container-2xl': maxWidth === '2xl',
          'container-3xl': maxWidth === '3xl',
          'container-full': maxWidth === 'full',
        },
        className
      )}
    >
      {children}
    </div>
  );
}
