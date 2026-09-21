/**
 * FilterBar - Filter control bar with multiple filter options
 */

import { ReactNode } from 'react';
import { X } from 'lucide-react';

export interface FilterOption {
  id: string;
  label: string;
  value: string;
}

export interface FilterBarProps {
  filters: Record<string, FilterOption[]>;
  activeFilters: Record<string, string>;
  onFilterChange: (filterKey: string, value: string) => void;
  onClearFilters: () => void;
  children?: ReactNode;
}

export function FilterBar({
  filters,
  activeFilters,
  onFilterChange,
  onClearFilters,
  children,
}: FilterBarProps) {
  const hasActiveFilters = Object.values(activeFilters).some(v => v);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {Object.entries(filters).map(([key, options]) => (
          <select
            key={key}
            value={activeFilters[key] || ''}
            onChange={e => onFilterChange(key, e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="">All {key}s</option>
            {options.map(opt => (
              <option key={opt.id} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ))}

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
          >
            <X className="h-4 w-4" />
            Clear filters
          </button>
        )}

        {children}
      </div>
    </div>
  );
}
