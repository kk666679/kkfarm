import { Bot, User, Server } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AIRole = 'user' | 'agent' | 'system';

interface AIAvatarProps {
  role: AIRole;
  size?: 'sm' | 'md';
  className?: string;
}

const CFG: Record<AIRole, { icon: typeof Bot; bg: string; fg: string; label: string }> = {
  user: { icon: User, bg: 'bg-muted', fg: 'text-foreground', label: 'You' },
  agent: { icon: Bot, bg: 'bg-primary/10', fg: 'text-primary', label: 'Assistant' },
  system: { icon: Server, bg: 'bg-muted', fg: 'text-muted-foreground', label: 'System' },
};

export function AIAvatar({ role, size = 'md', className }: AIAvatarProps) {
  const cfg = CFG[role];
  const Icon = cfg.icon;
  const dim = size === 'sm' ? 'h-6 w-6' : 'h-7 w-7';
  const iconDim = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full',
        dim,
        cfg.bg,
        cfg.fg,
        className
      )}
      aria-hidden="true"
    >
      <Icon className={iconDim} />
    </span>
  );
}

export function roleLabel(role: AIRole): string {
  return CFG[role].label;
}
