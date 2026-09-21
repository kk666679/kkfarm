'use client';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type RunStatus = 'idle' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';

export interface WorkflowRunControlsProps {
  status: RunStatus;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onRetry: () => void;
  pauseLoading?: boolean;
  resumeLoading?: boolean;
  stopLoading?: boolean;
  retryLoading?: boolean;
}

export function WorkflowRunControls({
  status,
  onPause,
  onResume,
  onStop,
  onRetry,
  pauseLoading,
  resumeLoading,
  stopLoading,
  retryLoading,
}: WorkflowRunControlsProps) {
  const isRunning = status === 'running';
  const isPaused = status === 'paused';
  const isTerminal = status === 'completed' || status === 'failed' || status === 'cancelled';

  return (
    <div className="flex items-center gap-2">
      {isRunning && (
        <Button variant="outline" size="sm" onClick={onPause} disabled={pauseLoading}>
          <Pause className="mr-2 h-3.5 w-3.5" />
          Pause
        </Button>
      )}
      {isPaused && (
        <Button variant="outline" size="sm" onClick={onResume} disabled={resumeLoading}>
          <Play className="mr-2 h-3.5 w-3.5" />
          Resume
        </Button>
      )}
      {!isTerminal && (
        <Button variant="destructive" size="sm" onClick={onStop} disabled={stopLoading}>
          <Square className="mr-2 h-3.5 w-3.5" />
          Stop
        </Button>
      )}
      {isTerminal && (
        <Button variant="outline" size="sm" onClick={onRetry} disabled={retryLoading}>
          <RotateCcw className="mr-2 h-3.5 w-3.5" />
          Retry
        </Button>
      )}
    </div>
  );
}
