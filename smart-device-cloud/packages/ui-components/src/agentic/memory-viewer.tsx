import React, { useState } from 'react';

export interface MemoryEntry {
  key: string;
  value: unknown;
  updatedAt: string;
}

export function MemoryViewer({ entries }: { entries: MemoryEntry[] }) {
  const [filter, setFilter] = useState('');
  const visible = filter ? entries.filter(e => e.key.includes(filter)) : entries;

  return (
    <div>
      <input
        value={filter}
        onChange={e => setFilter(e.target.value)}
        placeholder="Filter keys…"
        style={{
          marginBottom: 8,
          padding: '4px 8px',
          borderRadius: 4,
          border: '1px solid #e5e7eb',
          width: '100%',
        }}
      />
      {visible.length === 0 ? (
        <p style={{ color: '#9ca3af', fontSize: 13 }}>No memory entries.</p>
      ) : (
        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ textAlign: 'left', padding: '4px 8px' }}>Key</th>
              <th style={{ textAlign: 'left', padding: '4px 8px' }}>Value</th>
              <th style={{ textAlign: 'left', padding: '4px 8px' }}>Updated</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(e => (
              <tr key={e.key} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '4px 8px', fontFamily: 'monospace' }}>{e.key}</td>
                <td
                  style={{
                    padding: '4px 8px',
                    fontFamily: 'monospace',
                    maxWidth: 240,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {JSON.stringify(e.value)}
                </td>
                <td style={{ padding: '4px 8px', color: '#9ca3af' }}>{e.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
