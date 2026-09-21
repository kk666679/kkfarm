import React from 'react';

export interface ApprovalRequest {
  id: string;
  action: string;
  description: string;
  risk: 'low' | 'medium' | 'high';
}

export function ApprovalDialog({
  request,
  onApprove,
  onReject,
}: {
  request: ApprovalRequest;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const riskColor = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' }[request.risk];

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, maxWidth: 480 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <strong>{request.action}</strong>
        <span
          style={{ fontSize: 11, color: riskColor, textTransform: 'uppercase', fontWeight: 600 }}
        >
          {request.risk} risk
        </span>
      </div>
      <p style={{ margin: '0 0 16px', color: '#374151', fontSize: 14 }}>{request.description}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => onApprove(request.id)}
          style={{
            background: '#6366f1',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '6px 16px',
            cursor: 'pointer',
          }}
        >
          Approve
        </button>
        <button
          onClick={() => onReject(request.id)}
          style={{
            background: '#f3f4f6',
            color: '#374151',
            border: 'none',
            borderRadius: 6,
            padding: '6px 16px',
            cursor: 'pointer',
          }}
        >
          Reject
        </button>
      </div>
    </div>
  );
}
