'use client';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const STATUS_FILTERS = ['all', 'active', 'draft', 'archived'] as const;
export type StatusFilter = (typeof STATUS_FILTERS)[number];

export interface WorkflowFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
}

export function WorkflowFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
}: WorkflowFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search workflows…"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className="pl-9"
          aria-label="Search workflows"
        />
      </div>

      <div role="tablist" aria-label="Status filter" className="flex gap-2">
        {STATUS_FILTERS.map(s => (
          <Button
            key={s}
            role="tab"
            aria-selected={status === s}
            variant={status === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusChange(s)}
            className="capitalize"
          >
            {s}
          </Button>
        ))}
      </div>
    </div>
  );
}
