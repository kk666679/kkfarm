import React from 'react';

export interface EvalEntry {
  id: string;
  modelName: string;
  score: number;
  passRate: number;
  avgLatencyMs: number;
  totalRuns: number;
  rank: number;
}

export function EvalLeaderboard({ entries }: { entries: EvalEntry[] }) {
  const sorted = [...entries].sort((a, b) => a.rank - b.rank);
  return (
    <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
          {['#', 'Model', 'Score', 'Pass Rate', 'Avg Latency', 'Runs'].map(h => (
            <th key={h} style={{ textAlign: 'left', padding: '6px 8px' }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sorted.map(e => (
          <tr key={e.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
            <td style={{ padding: '6px 8px', color: '#6b7280' }}>{e.rank}</td>
            <td style={{ padding: '6px 8px', fontWeight: 500 }}>{e.modelName}</td>
            <td style={{ padding: '6px 8px' }}>{e.score.toFixed(2)}</td>
            <td style={{ padding: '6px 8px' }}>{(e.passRate * 100).toFixed(1)}%</td>
            <td style={{ padding: '6px 8px' }}>{e.avgLatencyMs}ms</td>
            <td style={{ padding: '6px 8px', color: '#6b7280' }}>{e.totalRuns}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
