/**
 * RefreshButton - Data refresh control
 */

import { RotateCcw } from 'lucide-react';
import { useState } from 'react';

interface RefreshButtonProps {
  onRefresh: () => Promise<void>;
  label?: string;
  interval?: number; // Auto-refresh interval in seconds
}

export function RefreshButton({ onRefresh, label = 'Refresh', interval }: RefreshButtonProps) {
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await onRefresh();
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={loading}
      className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
    >
      <RotateCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      {label}
      {lastRefresh && <span className="text-xs text-gray-500">(now)</span>}
    </button>
  );
}
