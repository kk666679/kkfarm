import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ContentCalendarEvent } from './ContentCalendarEvent';
import type { ContentItem } from '../types';

interface ContentCalendarViewProps {
  items: ContentItem[];
  month: Date;
  onMonthChange: (d: Date) => void;
  onItemClick?: (item: ContentItem) => void;
  className?: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

export function ContentCalendarView({
  items,
  month,
  onMonthChange,
  onItemClick,
  className,
}: ContentCalendarViewProps) {
  const first = startOfMonth(month);
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - first.getDay());
  const today = dayKey(new Date());

  const weeks = useMemo(() => {
    const rows: Date[][] = [];
    let cursor = new Date(gridStart);
    for (let w = 0; w < 6; w++) {
      const row: Date[] = [];
      for (let d = 0; d < 7; d++) {
        row.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }
      rows.push(row);
    }
    return rows;
  }, [gridStart.toISOString()]);

  const byDay = useMemo(() => {
    const map = new Map<string, ContentItem[]>();
    for (const it of items) {
      const iso = it.scheduledAt ?? it.publishedAt;
      if (!iso) continue;
      const key = dayKey(new Date(iso));
      const arr = map.get(key) ?? [];
      arr.push(it);
      map.set(key, arr);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) =>
        (a.scheduledAt ?? a.publishedAt ?? '').localeCompare(
          b.scheduledAt ?? b.publishedAt ?? ''
        )
      );
    }
    return map;
  }, [items]);

  return (
    <div className={cn('rounded-lg border border-border bg-card', className)}>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-base font-semibold text-foreground">
          {first.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => onMonthChange(addMonths(month, -1))}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onMonthChange(new Date())}
            className="rounded-md border border-border px-2 py-1 text-xs font-medium text-foreground hover:bg-muted"
          >
            Today
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => onMonthChange(addMonths(month, 1))}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAYS.map(w => (
          <div
            key={w}
            className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {weeks.flat().map((d, i) => {
          const key = dayKey(d);
          const inMonth = d.getMonth() === month.getMonth();
          const isToday = key === today;
          const dayItems = byDay.get(key) ?? [];

          return (
            <div
              key={i}
              className={cn(
                'min-h-[100px] border-b border-r border-border p-1.5',
                !inMonth && 'bg-muted/30',
                (i + 1) % 7 === 0 && 'border-r-0'
              )}
            >
              <div className="mb-1 flex items-center justify-between px-0.5">
                <span
                  className={cn(
                    'text-xs tabular-nums',
                    !inMonth && 'text-muted-foreground',
                    isToday &&
                      'inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground'
                  )}
                >
                  {d.getDate()}
                </span>
              </div>
              <div className="space-y-0.5">
                {dayItems.slice(0, 3).map(it => (
                  <ContentCalendarEvent
                    key={it.id}
                    item={it}
                    onClick={onItemClick}
                  />
                ))}
                {dayItems.length > 3 && (
                  <div className="px-1 text-[10px] text-muted-foreground">
                    +{dayItems.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
