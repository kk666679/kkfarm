'use client';
import type { DragEvent } from 'react';
import { cn } from '@/lib/utils';
import { PALETTE, CATEGORY_LABELS, type PaletteItem } from '../shared/palette';

export function NodePalette() {
  const onDragStart = (event: DragEvent<HTMLDivElement>, item: PaletteItem) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(item));
    event.dataTransfer.effectAllowed = 'move';
  };

  const grouped = PALETTE.reduce<Record<string, PaletteItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Node Palette</h3>
        <p className="text-xs text-muted-foreground">Drag a node onto the canvas</p>
      </div>
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="space-y-1.5">
          <h4 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
          </h4>
          {items.map(item => {
            const Icon = item.icon;
            return (
              <div
                key={`${item.type}-${item.label}`}
                role="button"
                tabIndex={0}
                aria-label={`Add ${item.label} node`}
                draggable
                onDragStart={e => onDragStart(e, item)}
                className={cn(
                  'flex cursor-grab items-center gap-2 rounded-md border border-border bg-card px-2.5 py-2 text-xs',
                  'transition-colors hover:border-primary/50 hover:bg-accent/50 active:cursor-grabbing'
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.label}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
