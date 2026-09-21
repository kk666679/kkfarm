import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusIndicatorProps {
  status: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusIndicator({ status, showLabel = true, size = 'md' }: StatusIndicatorProps) {
  const sizes = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  const colors: Record<string, string> = {
    available: 'bg-green-500',
    in_use: 'bg-yellow-500',
    maintenance: 'bg-orange-500',
    offline: 'bg-red-500',
    reserved: 'bg-blue-500',
    online: 'bg-green-500',
    busy: 'bg-yellow-500',
    error: 'bg-red-500',
    starting: 'bg-amber-500',
    stopping: 'bg-orange-500',
    queued: 'bg-slate-500',
    running: 'bg-blue-500',
    completed: 'bg-green-500',
    failed: 'bg-red-500',
    cancelled: 'bg-slate-500',
  };

  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    available: 'default',
    in_use: 'secondary',
    maintenance: 'outline',
    offline: 'destructive',
    reserved: 'outline',
    online: 'default',
    busy: 'secondary',
    error: 'destructive',
    starting: 'outline',
    stopping: 'outline',
    queued: 'secondary',
    running: 'secondary',
    completed: 'default',
    failed: 'destructive',
    cancelled: 'secondary',
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'rounded-full',
          sizes[size],
          colors[status] || 'bg-slate-500',
          status === 'available' || status === 'online' || status === 'running'
            ? 'animate-pulse'
            : ''
        )}
      />
      {showLabel && (
        <Badge variant={variants[status] || 'secondary'} className="text-xs">
          {status.replace('_', ' ').toUpperCase()}
        </Badge>
      )}
    </div>
  );
}
