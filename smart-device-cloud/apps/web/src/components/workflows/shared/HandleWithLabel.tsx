'use client';
import { Handle, Position, type HandleProps } from '@xyflow/react';
import { cn } from '@/lib/utils';

export interface HandleWithLabelProps extends HandleProps {
  label?: string;
  labelPosition?: 'above' | 'below';
}

export function HandleWithLabel({
  label,
  labelPosition = 'above',
  className,
  ...props
}: HandleWithLabelProps) {
  return (
    <>
      <Handle className={cn('!h-2 !w-2', className)} {...props} />
      {label && (
        <span
          className={cn(
            'pointer-events-none absolute -translate-x-1/2 whitespace-nowrap text-[9px] font-medium text-muted-foreground',
            props.position === Position.Left && '-left-2 -translate-x-full',
            props.position === Position.Right && '-right-2 translate-x-full',
            labelPosition === 'above' ? '-top-1' : '-bottom-4'
          )}
        >
          {label}
        </span>
      )}
    </>
  );
}
