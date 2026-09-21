import React from 'react';

export function TokenBudgetMeter({
  used,
  total,
  label = 'Tokens',
}: {
  used: number;
  total: number;
  label?: string;
}) {
  const pct = Math.min(100, (used / total) * 100);
  const color = pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#22c55e';

  return (
    <div style={{ fontSize: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ color: '#6b7280' }}>
          {used.toLocaleString()} / {total.toLocaleString()}
        </span>
      </div>
      <div style={{ height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: color,
            borderRadius: 3,
            transition: 'width 0.3s',
          }}
        />
      </div>
    </div>
  );
}
