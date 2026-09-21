import React from 'react';

export type StepStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface TimelineStep {
  id: string;
  label: string;
  status: StepStatus;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
}

const STATUS_COLOR: Record<StepStatus, string> = {
  pending: '#9ca3af',
  running: '#6366f1',
  completed: '#22c55e',
  failed: '#ef4444',
};

export function AgentRunTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {steps.map(step => (
        <li
          key={step.id}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: STATUS_COLOR[step.status],
              flexShrink: 0,
            }}
          />
          <span style={{ flex: 1 }}>{step.label}</span>
          {step.durationMs !== undefined && (
            <span style={{ color: '#6b7280', fontSize: 12 }}>{step.durationMs}ms</span>
          )}
          <span
            style={{ fontSize: 11, color: STATUS_COLOR[step.status], textTransform: 'uppercase' }}
          >
            {step.status}
          </span>
        </li>
      ))}
    </ol>
  );
}
