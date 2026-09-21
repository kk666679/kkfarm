import { cn } from '@/lib/utils';
import { ContentCard } from './ContentCard';
import { ContentEmptyState } from './ContentEmptyState';
import { ContentTable } from './ContentTable';
import type { ContentItem, ContentSort, ContentViewMode } from '../types';

interface ContentGridProps {
  items: ContentItem[];
  view?: ContentViewMode;
  selectedIds?: Set<string>;
  onSelectChange?: (id: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  sort?: ContentSort;
  onSortChange?: (sort: ContentSort) => void;
  emptyAction?: { label: string; onClick: () => void };
  className?: string;
}

export function ContentGrid({
  items,
  view = 'grid',
  selectedIds,
  onSelectChange,
  onSelectAll,
  sort,
  onSortChange,
  emptyAction,
  className,
}: ContentGridProps) {
  if (items.length === 0) {
    return (
      <ContentEmptyState
        onAction={emptyAction?.onClick}
        actionLabel={emptyAction?.label}
        className={className}
      />
    );
  }

  if (view === 'table') {
    return (
      <ContentTable
        items={items}
        selectedIds={selectedIds}
        onSelectChange={onSelectChange}
        onSelectAll={onSelectAll}
        sort={sort}
        onSortChange={onSortChange}
        className={className}
      />
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        className
      )}
    >
      {items.map(item => (
        <ContentCard
          key={item.id}
          item={item}
          selected={selectedIds?.has(item.id) ?? false}
          onSelectChange={onSelectChange ? v => onSelectChange(item.id, v) : undefined}
        />
      ))}
    </div>
  );
}
