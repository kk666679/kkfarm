/**
 * TokenBudgetMeter - Token usage progress meter
 */

interface TokenBudgetMeterProps {
  used: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
}

export function TokenBudgetMeter({
  used,
  total,
  label = 'Tokens',
  showPercentage = true,
}: TokenBudgetMeterProps) {
  const percentage = (used / total) * 100;
  const isWarning = percentage > 75;
  const isError = percentage > 90;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900">{label}</span>
        <span className="text-sm font-medium text-gray-600">
          {used.toLocaleString()} / {total.toLocaleString()}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${
            isError ? 'bg-red-600' : isWarning ? 'bg-yellow-600' : 'bg-green-600'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {showPercentage && (
        <div className="text-right">
          <span
            className={`text-xs font-medium ${
              isError ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-green-600'
            }`}
          >
            {percentage.toFixed(1)}% used
          </span>
        </div>
      )}
    </div>
  );
}
