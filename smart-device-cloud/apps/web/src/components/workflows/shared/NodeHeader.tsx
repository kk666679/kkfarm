'use client';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import type { NodeStatus } from '../types';

export interface NodeHeaderProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  status?: NodeStatus;
  variant?: 'default' | 'danger' | 'warning' | 'success' | 'info' | 'content';
}

export function NodeHeader({
  icon,
  title,
  subtitle,
  status = 'idle',
  variant = 'default',
}: NodeHeaderProps) {
  const statusIcon = {
    queued: <Loader2 className="h-3 w-3 animate-spin text-amber-500" />,
    success: <CheckCircle2 className="h-3 w-3 text-emerald-500" />,
    error: <XCircle className="h-3 w-3 text-destructive" />,
    idle: null,
    skipped: null,
  }[status];

  return (
    <div
      className={cn(
        'flex items-center gap-2 border-b px-3 py-2',
        variant === 'danger' && 'border-destructive/30 bg-destructive/5',
        variant === 'warning' && 'border-amber-500/30 bg-amber-500/5',
        variant === 'success' && 'border-emerald-500/30 bg-emerald-500/5',
        variant === 'info' && 'border-blue-500/30 bg-blue-500/5',
        variant === 'content' && 'border-fuchsia-500/30 bg-fuchsia-500/5',
        variant === 'default' && 'border-border bg-muted/30'
      )}
    >
      {icon && <span className="shrink-0 text-muted-foreground">{icon}</span>}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold">{title}</p>
        {subtitle && <p className="truncate text-[10px] text-muted-foreground">{subtitle}</p>}
      </div>
      {statusIcon}
    </div>
  );
}
