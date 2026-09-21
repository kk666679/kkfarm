import { useState } from 'react';
import { ImageOff, Heart, MessageCircle, Send, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlatformBadge } from '../badges/PlatformBadge';
import type { ContentAsset, ContentPlatform } from '../types';

interface ContentPreviewPaneProps {
  title: string;
  caption: string;
  hashtags: string[];
  assets: ContentAsset[];
  platforms: ContentPlatform[];
  className?: string;
}

export function ContentPreviewPane({ title, caption, hashtags, assets, platforms, className }: ContentPreviewPaneProps) {
  const first = assets[0];
  const fullCaption = [caption, hashtags.map(h => `#${h}`).join(' ')].filter(Boolean).join('\n\n');
  const items: ContentPlatform[] = platforms.length === 0 ? ['instagram'] : platforms;
  const [tab, setTab] = useState<ContentPlatform>(items[0]);

  return (
    <div className={cn('rounded-lg border border-border bg-card p-4', className)}>
      <h3 className="mb-3 text-sm font-semibold text-foreground">Preview</h3>
      <div className="flex flex-wrap gap-1 border-b border-border pb-2" role="tablist">
        {items.map(p => (
          <button key={p} type="button" role="tab" aria-selected={tab === p} onClick={() => setTab(p)} className={cn('inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', tab === p ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground')}>
            <PlatformBadge platform={p} className="h-4 min-w-4 px-1 text-[8px]" />
            <span className="hidden sm:inline capitalize">{p}</span>
          </button>
        ))}
      </div>
      <div className="mx-auto mt-4 max-w-sm overflow-hidden rounded-lg border border-border bg-background">
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-accent" />
          <div className="text-xs">
            <div className="font-semibold text-foreground">your_account</div>
            <div className="text-muted-foreground">Sponsored · 1s</div>
          </div>
        </div>
        <div className="aspect-square w-full bg-muted">
          {first?.kind === 'image' && first.url ? <img src={first.url} alt="" className="h-full w-full object-cover" /> :
           first?.kind === 'video' && first.thumbnailUrl ? <img src={first.thumbnailUrl} alt="" className="h-full w-full object-cover" /> :
           <div className="flex h-full w-full items-center justify-center text-muted-foreground"><ImageOff className="h-8 w-8" aria-hidden="true" /></div>}
        </div>
        <div className="flex items-center gap-3 px-3 py-2 text-foreground">
          <Heart className="h-5 w-5" aria-hidden="true" /><MessageCircle className="h-5 w-5" aria-hidden="true" /><Send className="h-5 w-5" aria-hidden="true" /><Bookmark className="ml-auto h-5 w-5" aria-hidden="true" />
        </div>
        <div className="px-3 pb-3 text-xs">
          <div className="line-clamp-1 font-semibold text-foreground">{title || 'Untitled'}</div>
          <p className="mt-1 whitespace-pre-line text-muted-foreground">{fullCaption || 'No caption yet'}</p>
        </div>
      </div>
    </div>
  );
}
