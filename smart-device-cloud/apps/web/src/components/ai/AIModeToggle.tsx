import { Hand, ShieldCheck, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AIMode = 'manual' | 'assisted' | 'autonomous';

interface AIModeToggleProps {
  value: AIMode;
  onChange: (mode: AIMode) => void;
  disabled?: boolean;
  className?: string;
}

const MODES: Array<{ value: AIMode; label: string; icon: LucideIcon; description: string }> = [
  { value: 'manual', label: 'Manual', icon: Hand, description: 'You drive. AI stays silent.' },
  { value: 'assisted', label: 'Assisted', icon: ShieldCheck, description: 'AI proposes. You approve each action.' },
  { value: 'autonomous', label: 'Autonomous', icon: Zap, description: 'Agent executes the approved plan. You monitor.' },
];

export function AIModeToggle({ value, onChange, disabled, className }: AIModeToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="AI operating mode"
      className={cn(
        'inline-flex rounded-lg border border-border bg-card p-0.5',
        disabled && 'opacity-60',
        className
      )}
    >
      {MODES.map(m => {
        const Icon = m.icon;
        const active = value === m.value;
        return (
          <button
            key={m.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(m.value)}
            disabled={disabled}
            title={m.description}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

export function modeDescription(mode: AIMode): string {
  return MODES.find(m => m.value === mode)?.description ?? '';
}
