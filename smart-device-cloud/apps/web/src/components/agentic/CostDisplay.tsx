/**
 * CostDisplay - Cost and token budget display
 */

import { TrendingUp } from 'lucide-react';

interface CostDisplayProps {
  cost: number;
  budget?: number;
  currency?: string;
  showTrend?: boolean;
  trend?: number;
}

export function CostDisplay({
  cost,
  budget,
  currency = '$',
  showTrend = false,
  trend,
}: CostDisplayProps) {
  const percentage = budget ? (cost / budget) * 100 : 0;
  const statusColor =
    percentage > 90 ? 'text-red-600' : percentage > 75 ? 'text-yellow-600' : 'text-green-600';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Cost</h3>
        {showTrend && trend && (
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="h-4 w-4 text-red-500" />
            <span className="text-red-600 font-medium">+{trend}%</span>
          </div>
        )}
      </div>

      <div className="text-3xl font-bold text-gray-900 mb-2">
        {currency}
        {cost.toFixed(4)}
      </div>

      {budget && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Budget used</span>
            <span className={`font-medium ${statusColor}`}>{percentage.toFixed(1)}%</span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                percentage > 90 ? 'bg-red-600' : percentage > 75 ? 'bg-yellow-600' : 'bg-green-600'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {currency}
              {cost.toFixed(4)}
            </span>
            <span>
              {currency}
              {budget.toFixed(4)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
