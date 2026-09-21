import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ResponsiveBadgeProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  truncate?: boolean;
}

/**
 * Responsive badge with adaptive sizing
 * - sm: Extra small, fits in tight spaces
 * - md: Standard size (default)
 * - lg: Larger, more prominent
 */
export function ResponsiveBadge({
  children,
  className,
  variant = 'default',
  size = 'md',
  truncate = false,
}: ResponsiveBadgeProps) {
  const sizeMap = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5',
    lg: 'text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2',
  };

  return (
    <Badge
      variant={variant}
      className={cn(sizeMap[size], truncate && 'max-w-full truncate', className)}
    >
      {children}
    </Badge>
  );
}
