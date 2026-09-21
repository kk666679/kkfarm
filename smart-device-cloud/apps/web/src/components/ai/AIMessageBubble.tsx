import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { AIAvatar, roleLabel, type AIRole } from './AIAvatar';
import { AIActionBar } from './AIActionBar';
import { AIModelBadge } from './AIModelBadge';
import { AICostMeter } from './AICostMeter';
import { AIStreamingText } from './AIStreamingText';

interface AIMessageBubbleProps {
  role: AIRole;
  children?: ReactNode;
  text?: string;
  streaming?: boolean;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: number;
  actions?: {
    onCopy?: () => void;
    onRetry?: () => void;
    onThumbsUp?: () => void;
    onThumbsDown?: () => void;
    onViewSources?: () => void;
  };
  className?: string;
}

export function AIMessageBubble({
  role,
  children,
  text,
  streaming = false,
  model,
  inputTokens,
  outputTokens,
  costUsd,
  actions,
  className,
}: AIMessageBubbleProps) {
  const isUser = role === 'user';
  const isAgent = role === 'agent';

  return (
    <div className={cn('flex gap-2.5', isUser && 'flex-row-reverse', className)}>
      <AIAvatar role={role} />
      <div className={cn('min-w-0 flex-1', isUser && 'flex flex-col items-end')}>
        <div className="mb-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground/80">{roleLabel(role)}</span>
          {isAgent && model && <AIModelBadge model={model} />}
          {isAgent && (
            <AICostMeter
              inputTokens={inputTokens}
              outputTokens={outputTokens}
              costUsd={costUsd}
            />
          )}
        </div>

        <div
          className={cn(
            'max-w-full rounded-lg px-3 py-2 text-sm',
            isUser
              ? 'bg-primary text-primary-foreground'
              : role === 'system'
                ? 'border border-dashed border-border bg-muted/40 text-muted-foreground'
                : 'bg-muted/50 text-foreground'
          )}
        >
          {children ?? (text !== undefined ? <AIStreamingText text={text} streaming={streaming} /> : null)}
        </div>

        {isAgent && actions && (
          <AIActionBar
            onCopy={actions.onCopy}
            onRetry={actions.onRetry}
            onThumbsUp={actions.onThumbsUp}
            onThumbsDown={actions.onThumbsDown}
            onViewSources={actions.onViewSources}
            className="mt-1"
          />
        )}
      </div>
    </div>
  );
}
