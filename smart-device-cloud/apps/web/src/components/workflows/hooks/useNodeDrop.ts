'use client';
import { useCallback, type DragEvent } from 'react';
import { useReactFlow, type Node } from '@xyflow/react';
import { useWorkflowStore } from './useWorkflowStore';

export function useNodeDrop() {
  const { screenToFlowPosition } = useReactFlow();
  const addNode = useWorkflowStore(s => s.addNode);
  const setSelectedNode = useWorkflowStore(s => s.setSelectedNode);

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      const raw = event.dataTransfer.getData('application/reactflow');
      if (!raw) return;

      let payload: { type: string; label: string; data?: Record<string, unknown> };
      try {
        payload = JSON.parse(raw);
      } catch {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const node: Node = {
        id: `${payload.type}-${crypto.randomUUID().slice(0, 8)}`,
        type: payload.type,
        position,
        data: {
          label: payload.label,
          ...(payload.data ?? {}),
          config: {},
        },
      };

      addNode(node);
      setSelectedNode(node.id);
    },
    [screenToFlowPosition, addNode, setSelectedNode]
  );

  return { onDrop, onDragOver };
}
