/**
 * PageContainer - Main content wrapper with max-width and padding
 */

import { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className={`mx-auto max-w-7xl px-4 py-6 sm:px-6 md:px-8 ${className}`}>{children}</div>
  );
}
