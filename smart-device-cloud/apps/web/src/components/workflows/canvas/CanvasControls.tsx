'use client';
import { Controls } from '@xyflow/react';
import { MiniMapPanel } from '../panels/MiniMapPanel';

export interface CanvasControlsProps {
  showMiniMap?: boolean;
  showInteractive?: boolean;
}

export function CanvasControls({
  showMiniMap = true,
  showInteractive = false,
}: CanvasControlsProps) {
  return (
    <>
      <Controls showInteractive={showInteractive} />
      {showMiniMap && <MiniMapPanel />}
    </>
  );
}
