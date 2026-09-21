/**
 * AgentRunTimeline - Turn-by-turn agent execution timeline
 */

import { CheckCircle, Clock, AlertCircle, Loader } from 'lucide-react';

export interface Turn {
  id: string;
  number: number;
  goal: string;
  thoughts: string;
  action: string;
  observation: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
  timestamp: Date;
}

interface AgentRunTimelineProps {
  turns: Turn[];
  currentTurnId?: string;
}

function getTurnIcon(status: Turn['status']) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'running':
      return <Loader className="h-5 w-5 text-blue-500 animate-spin" />;
    case 'failed':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Clock className="h-5 w-5 text-gray-400" />;
  }
}

export function AgentRunTimeline({ turns, currentTurnId }: AgentRunTimelineProps) {
  return (
    <div className="space-y-4">
      {turns.map((turn, idx) => (
        <div
          key={turn.id}
          className={`rounded-lg border-2 p-4 transition ${
            turn.id === currentTurnId ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
          }`}
        >
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="mt-1">{getTurnIcon(turn.status)}</div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Turn {turn.number}</h3>
                {turn.duration && <span className="text-xs text-gray-500">{turn.duration}ms</span>}
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <div className="text-xs font-medium text-gray-600">Goal</div>
                  <div className="text-gray-900">{turn.goal}</div>
                </div>

                {turn.thoughts && (
                  <div>
                    <div className="text-xs font-medium text-gray-600">Thoughts</div>
                    <div className="text-gray-700 italic">{turn.thoughts}</div>
                  </div>
                )}

                <div>
                  <div className="text-xs font-medium text-gray-600">Action</div>
                  <code className="block bg-gray-100 rounded px-2 py-1 text-xs overflow-x-auto">
                    {turn.action}
                  </code>
                </div>

                {turn.observation && (
                  <div>
                    <div className="text-xs font-medium text-gray-600">Observation</div>
                    <div className="bg-gray-50 rounded px-2 py-1 text-xs">{turn.observation}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
