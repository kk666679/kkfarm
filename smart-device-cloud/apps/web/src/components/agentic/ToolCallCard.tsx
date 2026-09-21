/**
 * ToolCallCard - Individual tool call visualization
 */

import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export interface ToolCall {
  id: string;
  toolName: string;
  toolType: string;
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  duration?: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  approvalRequired?: boolean;
}

interface ToolCallCardProps {
  call: ToolCall;
  onApprove?: () => void;
  onReject?: () => void;
}

export function ToolCallCard({ call, onApprove, onReject }: ToolCallCardProps) {
  const [expanded, setExpanded] = useState(false);

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    running: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-3 flex-1">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
          <div className="text-left">
            <div className="font-medium text-gray-900">{call.toolName}</div>
            <div className="text-xs text-gray-500">{call.toolType}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[call.status]}`}
          >
            {call.status}
          </span>
          {call.duration && <span className="text-xs text-gray-500">{call.duration}ms</span>}
        </div>
      </button>

      {/* Details */}
      {expanded && (
        <div className="border-t border-gray-200 px-4 py-3 space-y-3 bg-gray-50">
          {/* Input */}
          <div>
            <div className="text-xs font-semibold text-gray-700 mb-1">Input</div>
            <pre className="bg-white rounded p-2 text-xs overflow-x-auto border border-gray-200">
              {JSON.stringify(call.input, null, 2)}
            </pre>
          </div>

          {/* Output */}
          {call.output && (
            <div>
              <div className="text-xs font-semibold text-gray-700 mb-1">Output</div>
              <pre className="bg-white rounded p-2 text-xs overflow-x-auto border border-gray-200">
                {JSON.stringify(call.output, null, 2)}
              </pre>
            </div>
          )}

          {/* Error */}
          {call.error && (
            <div>
              <div className="text-xs font-semibold text-red-700 mb-1">Error</div>
              <div className="bg-red-50 rounded p-2 text-xs text-red-700 border border-red-200">
                {call.error}
              </div>
            </div>
          )}

          {/* Approval */}
          {call.approvalRequired && (
            <div className="flex gap-2">
              <button
                onClick={onApprove}
                className="flex-1 rounded-lg bg-green-600 text-white px-3 py-2 text-sm font-medium hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={onReject}
                className="flex-1 rounded-lg bg-red-600 text-white px-3 py-2 text-sm font-medium hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
