import { useCallback, useRef, useState } from 'react';
import { Send, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AIContextChips, type AIContextChip } from './AIContextChips';
import { AILoadingDots } from './AILoadingDots';
import { AIMessageBubble } from './AIMessageBubble';
import { AIPromptSuggestions, type StarterPrompt } from './AIPromptSuggestions';
import { AISuggestionChips } from './AISuggestionChips';
import { AgentSurfaceRenderer } from './AgentSurfaceRenderer';
import { AIErrorFallback } from './AIErrorFallback';
import { AIModeToggle, type AIMode } from './AIModeToggle';
import type { AgentSurface } from '@/types/agent-surface';

export interface CopilotTurn {
  id: string;
  role: 'user' | 'agent' | 'system';
  at: string;
  text?: string;
  surface?: AgentSurface;
  streaming?: boolean;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: number;
  error?: { message: string; detail?: string };
}

export interface OperationsCopilotProps {
  className?: string;
  title?: string;
  suggestions?: string[];
  starterPrompts?: StarterPrompt[];
  contextChips?: AIContextChip[];
  mode?: AIMode;
  onModeChange?: (mode: AIMode) => void;
  onSend?: (input: string) => void | Promise<void>;
  onRetryLast?: () => void;
  onClose?: () => void;
  onApprove?: (approvalId: string) => void;
  onReject?: (approvalId: string) => void;
  turns?: CopilotTurn[];
  bare?: boolean;
}

export function OperationsCopilot({
  className,
  title = 'Operations Copilot',
  suggestions = [],
  starterPrompts,
  contextChips = [],
  mode,
  onModeChange,
  onSend,
  onRetryLast,
  onClose,
  onApprove,
  onReject,
  turns = [],
  bare = false,
}: OperationsCopilotProps) {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const submit = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || sending || !onSend) return;
      setSending(true);
      setInput('');
      try {
        await onSend(trimmed);
      } finally {
        setSending(false);
        inputRef.current?.focus();
      }
    },
    [onSend, sending]
  );

  const isEmpty = turns.length === 0;

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden',
        !bare && 'rounded-lg border border-border bg-card',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {mode && onModeChange && <AIModeToggle value={mode} onChange={onModeChange} />}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close copilot"
              className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        <div className="space-y-4">
          {isEmpty && starterPrompts && starterPrompts.length > 0 && (
            <AIPromptSuggestions prompts={starterPrompts} onSelect={submit} />
          )}

          {isEmpty && !starterPrompts && suggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Try:</p>
              <AISuggestionChips suggestions={suggestions} onSelect={submit} disabled={sending} />
            </div>
          )}

          {turns.map(t => (
            <AIMessageBubble
              key={t.id}
              role={t.role}
              text={t.text}
              streaming={t.streaming}
              model={t.model}
              inputTokens={t.inputTokens}
              outputTokens={t.outputTokens}
              costUsd={t.costUsd}
              actions={
                t.role === 'agent'
                  ? {
                      onCopy: () => {
                        if (t.text) void navigator.clipboard?.writeText(t.text);
                      },
                      onRetry: onRetryLast,
                    }
                  : undefined
              }
            >
              {t.surface && (
                <AgentSurfaceRenderer
                  surface={t.surface}
                  onApprove={onApprove}
                  onReject={onReject}
                />
              )}
              {t.error && (
                <AIErrorFallback
                  message={t.error.message}
                  detail={t.error.detail}
                  onRetry={onRetryLast}
                />
              )}
            </AIMessageBubble>
          ))}

          {sending && (
            <div className="flex justify-start">
              <AILoadingDots />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 border-t border-border p-3">
        {contextChips.length > 0 && <AIContextChips chips={contextChips} />}
        <form
          onSubmit={e => {
            e.preventDefault();
            submit(input);
          }}
          className="flex items-end gap-2"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit(input);
              }
            }}
            rows={1}
            placeholder="Ask about your fleet..."
            aria-label="Ask the copilot"
            className="min-h-[36px] flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={sending || input.trim().length === 0}
            aria-label="Send"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}
