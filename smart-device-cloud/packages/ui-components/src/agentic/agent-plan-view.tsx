import React from 'react';

export interface PlanStep {
  id: string;
  description: string;
  tool?: string;
  dependsOn?: string[];
  status: 'planned' | 'active' | 'done' | 'skipped';
}

export function AgentPlanView({ steps }: { steps: PlanStep[] }) {
  return (
    <div style={{ fontFamily: 'monospace', fontSize: 13 }}>
      {steps.map((step, i) => (
        <div
          key={step.id}
          style={{
            display: 'flex',
            gap: 8,
            padding: '4px 0',
            opacity: step.status === 'skipped' ? 0.4 : 1,
          }}
        >
          <span style={{ color: '#6b7280' }}>{i + 1}.</span>
          <span style={{ flex: 1 }}>{step.description}</span>
          {step.tool && (
            <code style={{ background: '#f3f4f6', padding: '1px 4px', borderRadius: 3 }}>
              {step.tool}
            </code>
          )}
        </div>
      ))}
    </div>
  );
}
