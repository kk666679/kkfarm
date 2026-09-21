'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRealtime } from '@/hooks/useRealtime';
import type { LogEntry, TimelineEvent } from '../types';

type ExecStatus = 'idle' | 'running' | 'paused' | 'completed' | 'failed';

interface ExecutionState {
  sessionId: string | null;
  status: ExecStatus;
  currentNodeId: string | null;
  nodeStatus: Record<string, string>;
  edgeStatus: Record<string, string>;
  variables: Record<string, unknown>;
  logs: LogEntry[];
  events: TimelineEvent[];
  durationMs: number;
  tokensUsed: number;
  costUsd: number;
}

export function useWorkflowExecution({ executionId }: { executionId: string | null }) {
  const [state, setState] = useState<ExecutionState>({
    sessionId: executionId,
    status: 'idle',
    currentNodeId: null,
    nodeStatus: {},
    edgeStatus: {},
    variables: {},
    logs: [],
    events: [],
    durationMs: 0,
    tokensUsed: 0,
    costUsd: 0,
  });

  useRealtime({
    channel: executionId ? `workflow:execution:${executionId}` : '',
    enabled: !!executionId,
    onMessage: event => {
      setState(prev => applyEvent(prev, event));
    },
  });

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: 'idle',
      currentNodeId: null,
      nodeStatus: {},
      edgeStatus: {},
      logs: [],
      events: [],
      durationMs: 0,
      tokensUsed: 0,
      costUsd: 0,
    }));
  }, []);

  return { ...state, reset };
}

function applyEvent(prev: ExecutionState, event: any): ExecutionState {
  const events = [
    ...prev.events,
    { type: event.type, timestamp: event.timestamp ?? new Date().toISOString(), data: event },
  ];

  switch (event.type) {
    case 'node.started':
      return {
        ...prev,
        events,
        status: 'running',
        currentNodeId: event.nodeId,
        nodeStatus: { ...prev.nodeStatus, [event.nodeId]: 'running' },
      };
    case 'node.completed':
      return { ...prev, events, nodeStatus: { ...prev.nodeStatus, [event.nodeId]: 'success' } };
    case 'node.failed':
      return { ...prev, events, nodeStatus: { ...prev.nodeStatus, [event.nodeId]: 'error' } };
    case 'edge.activated':
      return { ...prev, events, edgeStatus: { ...prev.edgeStatus, [event.edgeId]: 'running' } };
    case 'edge.completed':
      return { ...prev, events, edgeStatus: { ...prev.edgeStatus, [event.edgeId]: 'success' } };
    case 'execution.completed':
      return {
        ...prev,
        events,
        status: 'completed',
        durationMs: event.durationMs ?? prev.durationMs,
      };
    case 'execution.failed':
      return { ...prev, events, status: 'failed' };
    case 'debug.log':
      return { ...prev, events, logs: [...prev.logs, event.entry] };
    default:
      return { ...prev, events };
  }
}
