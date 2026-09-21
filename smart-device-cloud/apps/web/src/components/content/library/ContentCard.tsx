import { Link } from 'react-router-dom';
import { MoreHorizontal, ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ContentTypeBadge } from '../badges/ContentTypeBadge';
import { ContentStatusBadge } from '../badges/ContentStatusBadge';
import { PlatformBadgeList } from '../badges/PlatformBadge';
import type { ContentItem } from '../types';

function formatDate(iso?: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

interface ContentCardProps {
  item: ContentItem;
  selected?: boolean;
  onSelectChange?: (selected: boolean) => void;
  className?: string;
}

export function ContentCard({
  item,
  selected = false,
  onSelectChange,
  className,
}: ContentCardProps) {
  const thumb = item.assets.find(a => a.thumbnailUrl || a.kind === 'image');
  const dateLabel = item.publishedAt
    ? `Published ${formatDate(item.publishedAt)}`
    : item.scheduledAt
      ? `Scheduled ${formatDate(item.scheduledAt)}`
      : `Updated ${formatDate(item.updatedAt)}`;

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md',
        selected && 'ring-2 ring-ring',
        className
      )}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {thumb?.thumbnailUrl || (thumb?.kind === 'image' && thumb.url) ? (
          <img
            src={thumb.thumbnailUrl ?? thumb.url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageOff className="h-8 w-8" aria-hidden="true" />
          </div>
        )}
        {onSelectChange && (
          <label className="absolute left-2 top-2 inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={selected}
              onChange={e => onSelectChange(e.target.checked)}
              aria-label={`Select ${item.title}`}
              className="h-4 w-4 cursor-pointer rounded border-input accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
        )}
      </div>

      <div className="flex items-start justify-between gap-2 px-3 pt-3 pb-1">
        <div className="min-w-0 flex-1">
          <Link
            to={`/content/${item.id}`}
            className="line-clamp-1 text-sm font-semibold text-foreground hover:underline"
          >
            {item.title}
          </Link>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
            {item.caption || 'No caption'}
          </p>
        </div>
        <button
          type="button"
          aria-label="Content actions"
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-3 pb-2">
        <ContentTypeBadge type={item.type} />
        <ContentStatusBadge status={item.status} />
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border px-3 py-2.5">
        <PlatformBadgeList platforms={item.platforms} max={4} />
        <span className="text-xs text-muted-foreground">{dateLabel}</span>
      </div>
    </article>
  );
}
