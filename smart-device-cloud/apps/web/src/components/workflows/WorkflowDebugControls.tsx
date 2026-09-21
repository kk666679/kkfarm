'use client';
import {
  Play,
  Pause,
  Square,
  StepForward,
  CornerDownRight,
  CornerUpLeft,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface WorkflowDebugControlsProps {
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
  breakpointCount: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onStepOver: () => void;
  onStepInto: () => void;
  onStepOut: () => void;
  onContinue: () => void;
  onClearBreakpoints: () => void;
}

export function WorkflowDebugControls({
  status,
  breakpointCount,
  onStart,
  onPause,
  onResume,
  onStop,
  onStepOver,
  onStepInto,
  onStepOut,
  onContinue,
  onClearBreakpoints,
}: WorkflowDebugControlsProps) {
  const isActive = status === 'running' || status === 'paused';

  if (!isActive) {
    return (
      <Button onClick={onStart}>
        <Play className="mr-2 h-4 w-4" />
        Start Debug
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === 'running' ? (
        <Button variant="outline" size="sm" onClick={onPause}>
          <Pause className="mr-2 h-3.5 w-3.5" />
          Pause
        </Button>
      ) : (
        <Button variant="outline" size="sm" onClick={onResume}>
          <Play className="mr-2 h-3.5 w-3.5" />
          Resume
        </Button>
      )}

      <div className="mx-1 h-6 w-px bg-border" />

      <Button variant="outline" size="sm" onClick={onStepOver} disabled={status !== 'paused'}>
        <StepForward className="mr-2 h-3.5 w-3.5" />
        Step Over
      </Button>
      <Button variant="outline" size="sm" onClick={onStepInto} disabled={status !== 'paused'}>
        <CornerDownRight className="mr-2 h-3.5 w-3.5" />
        Step Into
      </Button>
      <Button variant="outline" size="sm" onClick={onStepOut} disabled={status !== 'paused'}>
        <CornerUpLeft className="mr-2 h-3.5 w-3.5" />
        Step Out
      </Button>
      <Button variant="outline" size="sm" onClick={onContinue} disabled={status !== 'paused'}>
        <Play className="mr-2 h-3.5 w-3.5" />
        Continue
      </Button>

      <div className="ml-auto flex items-center gap-2">
        <Badge variant="secondary">
          {breakpointCount} breakpoint{breakpointCount === 1 ? '' : 's'}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearBreakpoints}
          disabled={breakpointCount === 0}
        >
          <Trash2 className="mr-2 h-3.5 w-3.5" />
          Clear
        </Button>
        <Button variant="destructive" size="sm" onClick={onStop}>
          <Square className="mr-2 h-3.5 w-3.5" />
          Stop
        </Button>
      </div>
    </div>
  );
}
