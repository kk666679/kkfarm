import { useCallback, useRef, useState } from 'react';
import { ImagePlus, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ContentAsset } from '../types';

function fileToAsset(file: File): ContentAsset {
  const url = URL.createObjectURL(file);
  const kind: ContentAsset['kind'] = file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'audio' : 'image';
  return { id: `local-${Date.now()}-${file.name}`, kind, url, thumbnailUrl: kind === 'image' ? url : undefined, sizeBytes: file.size };
}

interface ContentMediaUploaderProps {
  assets: ContentAsset[];
  onChange: (assets: ContentAsset[]) => void;
  maxFiles?: number;
  accept?: string;
  className?: string;
}

export function ContentMediaUploader({ assets, onChange, maxFiles = 10, accept = 'image/*,video/*', className }: ContentMediaUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const next = [...assets];
    for (const f of Array.from(files)) { if (next.length >= maxFiles) break; next.push(fileToAsset(f)); }
    onChange(next);
  }, [assets, maxFiles, onChange]);

  const remove = (id: string) => {
    const a = assets.find(x => x.id === id);
    if (a?.url.startsWith('blob:')) URL.revokeObjectURL(a.url);
    onChange(assets.filter(x => x.id !== id));
  };

  return (
    <div className={className}>
      <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }} className={cn('flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 text-center transition', dragging ? 'border-primary bg-primary/5' : 'border-border bg-card/50 hover:border-muted-foreground')}>
        <ImagePlus className="mb-2 h-8 w-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-foreground">Drag and drop media here, or</p>
        <button type="button" onClick={() => inputRef.current?.click()} className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Upload className="h-4 w-4" aria-hidden="true" />Choose files
        </button>
        <input ref={inputRef} type="file" accept={accept} multiple className="sr-only" onChange={e => { addFiles(e.target.files); e.target.value = ''; }} />
        <p className="mt-2 text-xs text-muted-foreground">Up to {maxFiles} files</p>
      </div>
      {assets.length > 0 && (
        <ul role="list" className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {assets.map(a => (
            <li key={a.id} className="group relative overflow-hidden rounded-lg border border-border">
              <div className="aspect-square w-full bg-muted">
                {a.thumbnailUrl ?? (a.kind === 'image' ? a.url : undefined) ? <img src={a.thumbnailUrl ?? a.url} alt="" loading="lazy" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">{a.kind}</div>}
              </div>
              <button type="button" onClick={() => remove(a.id)} aria-label={`Remove ${a.kind}`} className="absolute right-1 top-1 rounded-full bg-background/90 p-1 text-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
