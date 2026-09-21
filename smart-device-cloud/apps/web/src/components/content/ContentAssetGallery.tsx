import { ImageOff, Maximize2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { ContentAsset } from './types';

interface ContentAssetGalleryProps {
  assets: ContentAsset[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function ContentAssetGallery({ assets, columns = 3, className }: ContentAssetGalleryProps) {
  const [expanded, setExpanded] = useState<ContentAsset | null>(null);

  if (assets.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 py-10 text-sm text-muted-foreground', className)}>
        <ImageOff className="mb-2 h-6 w-6" aria-hidden="true" />
        No assets
      </div>
    );
  }

  const colClass = columns === 2 ? 'sm:grid-cols-2' : columns === 4 ? 'sm:grid-cols-4' : 'sm:grid-cols-3';

  return (
    <>
      <ul role="list" className={cn('grid grid-cols-1 gap-3', colClass, className)}>
        {assets.map(asset => (
          <li key={asset.id} className="group relative overflow-hidden rounded-lg border border-border bg-card">
            <ContentAssetTile asset={asset} />
            {asset.kind === 'image' && (
              <button type="button" onClick={() => setExpanded(asset)} aria-label="Expand image" className="absolute right-2 top-2 rounded-md bg-background/80 p-1.5 text-foreground opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </li>
        ))}
      </ul>
      {expanded && (
        <div role="dialog" aria-modal="true" aria-label="Asset preview" className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setExpanded(null)}>
          <img src={expanded.url} alt="" className="max-h-full max-w-full rounded-lg object-contain" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}

function ContentAssetTile({ asset }: { asset: ContentAsset }) {
  if (asset.kind === 'image') {
    return <img src={asset.url} alt="" loading="lazy" className="aspect-square h-full w-full object-cover" />;
  }
  if (asset.kind === 'video') {
    return (
      <div className="aspect-square w-full bg-muted">
        {asset.thumbnailUrl ? (
          <img src={asset.thumbnailUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <video src={asset.url} controls preload="metadata" className="h-full w-full object-cover" />
        )}
      </div>
    );
  }
  return (
    <div className="flex aspect-square w-full items-center justify-center p-3">
      <audio src={asset.url} controls className="w-full" />
    </div>
  );
}

export function ContentAssetStrip({ assets, className }: { assets: ContentAsset[]; className?: string }) {
  if (assets.length === 0) return null;
  return (
    <ul role="list" className={cn('flex flex-wrap gap-1.5', className)}>
      {assets.map(a => (
        <li key={a.id} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-0.5 text-xs text-foreground">
          <span className={cn('h-1.5 w-1.5 rounded-full', a.kind === 'image' && 'bg-primary', a.kind === 'video' && 'bg-accent', a.kind === 'audio' && 'bg-muted-foreground')} aria-hidden="true" />
          <span className="capitalize text-muted-foreground">{a.kind}</span>
        </li>
      ))}
    </ul>
  );
}
