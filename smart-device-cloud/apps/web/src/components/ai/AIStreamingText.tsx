import { cn } from '@/lib/utils';

interface AIStreamingTextProps {
  text: string;
  streaming?: boolean;
  className?: string;
}

export function AIStreamingText({
  text,
  streaming = false,
  className,
}: AIStreamingTextProps) {
  return (
    <span className={cn('whitespace-pre-wrap text-sm text-foreground', className)}>
      {text}
      {streaming && (
        <span
          className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-foreground align-text-bottom"
          aria-hidden="true"
        />
      )}
    </span>
  );
}
