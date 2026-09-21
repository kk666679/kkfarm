import React from 'react';

export function CostDisplay({ usd, label = 'Cost' }: { usd: number; label?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
      <span style={{ fontSize: 11, color: '#6b7280' }}>{label}</span>
      <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
        ${usd < 0.01 ? usd.toFixed(5) : usd.toFixed(4)}
      </span>
    </div>
  );
}
