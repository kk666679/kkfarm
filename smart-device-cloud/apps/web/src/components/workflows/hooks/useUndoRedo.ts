'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useWorkflowStore } from './useWorkflowStore';
import type { Node, Edge } from '@xyflow/react';

interface Snapshot {
  nodes: Node[];
  edges: Edge[];
}

export function useUndoRedo({ maxHistory = 50 } = {}) {
  const [past, setPast] = useState<Snapshot[]>([]);
  const [future, setFuture] = useState<Snapshot[]>([]);
  const lastSnapshot = useRef<Snapshot | null>(null);

  const { nodes, edges, setWorkflow } = useWorkflowStore();

  useEffect(() => {
    const snapshot: Snapshot = { nodes, edges };
    if (lastSnapshot.current && JSON.stringify(lastSnapshot.current) === JSON.stringify(snapshot))
      return;
    setPast(p => [...p, lastSnapshot.current ?? snapshot].slice(-maxHistory));
    setFuture([]);
    lastSnapshot.current = snapshot;
  }, [nodes, edges, maxHistory]);

  const onUndo = useCallback(() => {
    setPast(p => {
      if (p.length === 0) return p;
      const previous = p[p.length - 1];
      setFuture(f => [lastSnapshot.current ?? { nodes, edges }, ...f]);
      setWorkflow(previous.nodes, previous.edges);
      lastSnapshot.current = previous;
      return p.slice(0, -1);
    });
  }, [nodes, edges, setWorkflow]);

  const onRedo = useCallback(() => {
    setFuture(f => {
      if (f.length === 0) return f;
      const next = f[0];
      setPast(p => [...p, lastSnapshot.current ?? { nodes, edges }]);
      setWorkflow(next.nodes, next.edges);
      lastSnapshot.current = next;
      return f.slice(1);
    });
  }, [nodes, edges, setWorkflow]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        onUndo();
      }
      if (mod && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        onRedo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onUndo, onRedo]);

  return { onUndo, onRedo, canUndo: past.length > 0, canRedo: future.length > 0 };
}
