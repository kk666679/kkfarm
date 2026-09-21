'use client';
import { Badge } from '@/components/ui/badge';
import type { ExecutionStatus } from '../types';

export function StatusBadge({ status }: { status: ExecutionStatus }) {
  const variantMap = {
    idle: 'outline',
    queued: 'outline',
    running: 'default',
    paused: 'outline',
    success: 'secondary',
    completed: 'secondary',
    error: 'destructive',
    failed: 'destructive',
    cancelled: 'outline',
    skipped: 'outline',
  } as const satisfies Record<
    ExecutionStatus,
    'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'
  >;

  const variant = variantMap[status];

  return (
    <Badge variant={variant} className="capitalize text-[10px]">
      {status}
    </Badge>
  );
}
