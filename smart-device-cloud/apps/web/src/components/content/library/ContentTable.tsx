import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ContentTypeBadge } from '../badges/ContentTypeBadge';
import { ContentStatusBadge } from '../badges/ContentStatusBadge';
import { PlatformBadgeList } from '../badges/PlatformBadge';
import type { ContentItem, ContentSort, ContentSortKey } from '../types';

function formatDate(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

interface Column {
  key: ContentSortKey | null;
  label: string;
  className?: string;
}

const COLUMNS: Column[] = [
  { key: null, label: '', className: 'w-8' },
  { key: 'title', label: 'Title' },
  { key: null, label: 'Type' },
  { key: null, label: 'Status' },
  { key: null, label: 'Platforms' },
  { key: null, label: 'Accounts', className: 'text-right' },
  { key: 'scheduledAt', label: 'Scheduled' },
  { key: 'updatedAt', label: 'Updated' },
];

interface ContentTableProps {
  items: ContentItem[];
  selectedIds?: Set<string>;
  onSelectChange?: (id: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  sort?: ContentSort;
  onSortChange?: (sort: ContentSort) => void;
  className?: string;
}

export function ContentTable({
  items,
  selectedIds,
  onSelectChange,
  onSelectAll,
  sort,
  onSortChange,
  className,
}: ContentTableProps) {
  const allSelected =
    items.length > 0 && selectedIds ? items.every(i => selectedIds.has(i.id)) : false;
  const someSelected =
    !allSelected && selectedIds ? items.some(i => selectedIds.has(i.id)) : false;

  return (
    <div className={cn('overflow-x-auto rounded-lg border border-border', className)}>
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/40">
          <tr>
            {COLUMNS.map((col, idx) => (
              <th
                key={idx}
                scope="col"
                className={cn(
                  'px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground',
                  col.className
                )}
              >
                {idx === 0 && onSelectChange && onSelectAll ? (
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={el => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={e => onSelectAll(e.target.checked)}
                    aria-label="Select all"
                    className="h-4 w-4 cursor-pointer rounded border-input accent-primary"
                  />
                ) : col.key ? (
                  <button
                    type="button"
                    onClick={() =>
                      onSortChange?.({
                        key: col.key!,
                        dir: sort?.key === col.key && sort.dir === 'asc' ? 'desc' : 'asc',
                      })
                    }
                    className="inline-flex items-center gap-1 rounded hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {col.label}
                    {sort?.key === col.key &&
                      (sort.dir === 'asc' ? (
                        <ArrowUp className="h-3 w-3" aria-hidden="true" />
                      ) : (
                        <ArrowDown className="h-3 w-3" aria-hidden="true" />
                      ))}
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map(item => {
            const selected = selectedIds?.has(item.id) ?? false;
            const thumb = item.assets.find(a => a.thumbnailUrl);
            return (
              <tr
                key={item.id}
                className={cn('transition-colors hover:bg-muted/40', selected && 'bg-muted/60')}
              >
                <td className="px-3 py-2">
                  {onSelectChange && (
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={e => onSelectChange(item.id, e.target.checked)}
                      aria-label={`Select ${item.title}`}
                      className="h-4 w-4 cursor-pointer rounded border-input accent-primary"
                    />
                  )}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 shrink-0 overflow-hidden rounded bg-muted">
                      {thumb?.thumbnailUrl ? (
                        <img
                          src={thumb.thumbnailUrl}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <ImageOff className="h-4 w-4" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <Link
                      to={`/content/${item.id}`}
                      className="line-clamp-1 font-medium text-foreground hover:underline"
                    >
                      {item.title}
                    </Link>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <ContentTypeBadge type={item.type} showIcon={false} />
                </td>
                <td className="px-3 py-2">
                  <ContentStatusBadge status={item.status} />
                </td>
                <td className="px-3 py-2">
                  <PlatformBadgeList platforms={item.platforms} max={3} />
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-foreground">
                  {item.accountIds.length}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {formatDate(item.scheduledAt)}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {formatDate(item.updatedAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
