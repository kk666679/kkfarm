import React, { useState } from 'react';

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
  output?: unknown;
  error?: string;
  durationMs?: number;
}

export function ToolCallCard({ call }: { call: ToolCall }) {
  const [expanded, setExpanded] = useState(false);
  const hasError = Boolean(call.error);

  return (
    <div
      style={{
        border: `1px solid ${hasError ? '#fca5a5' : '#e5e7eb'}`,
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
      }}
    >
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
        onClick={() => setExpanded(v => !v)}
      >
        <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>
          {call.name}
        </code>
        {call.durationMs !== undefined && (
          <span style={{ color: '#6b7280', fontSize: 11 }}>{call.durationMs}ms</span>
        )}
        {hasError && <span style={{ color: '#ef4444', fontSize: 11 }}>error</span>}
        <span style={{ marginLeft: 'auto', color: '#9ca3af' }}>{expanded ? '▲' : '▼'}</span>
      </div>
      {expanded && (
        <div style={{ marginTop: 8, fontSize: 12 }}>
          <div>
            <strong>Input:</strong>
            <pre style={{ margin: 0 }}>{JSON.stringify(call.input, null, 2)}</pre>
          </div>
          {call.output !== undefined && (
            <div>
              <strong>Output:</strong>
              <pre style={{ margin: 0 }}>{JSON.stringify(call.output, null, 2)}</pre>
            </div>
          )}
          {call.error && (
            <div style={{ color: '#ef4444' }}>
              <strong>Error:</strong> {call.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
