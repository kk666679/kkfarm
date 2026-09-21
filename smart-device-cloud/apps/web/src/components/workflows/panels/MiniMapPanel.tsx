'use client';
import { MiniMap } from '@xyflow/react';
import { NODE_COLORS } from '../shared/constants';

export function MiniMapPanel() {
  return (
    <MiniMap
      pannable
      zoomable
      nodeColor={node => NODE_COLORS[node.type ?? 'custom'] ?? '#94a3b8'}
      className="!bottom-3 !right-3"
    />
  );
}
