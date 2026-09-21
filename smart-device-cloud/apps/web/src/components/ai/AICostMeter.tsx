import { Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AICostMeterProps {
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: number;
  className?: string;
}

function fmt(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function AICostMeter({
  inputTokens,
  outputTokens,
  costUsd,
  className,
}: AICostMeterProps) {
  const tokens =
    inputTokens !== undefined || outputTokens !== undefined
      ? (inputTokens ?? 0) + (outputTokens ?? 0)
      : undefined;

  if (tokens === undefined && costUsd === undefined) return null;

  return (
    <span
      className={cn('inline-flex items-center gap-2 text-[10px] text-muted-foreground', className)}
    >
      <Coins className="h-3 w-3" aria-hidden="true" />
      {tokens !== undefined && (
        <span className="tabular-nums" title="Tokens used">
          {fmt(tokens)} tok
        </span>
      )}
      {costUsd !== undefined && (
        <span className="tabular-nums" title="Cost">
          ${costUsd.toFixed(costUsd < 0.01 ? 4 : 2)}
        </span>
      )}
    </span>
  );
}
