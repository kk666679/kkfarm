'use client';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ContentPlatformId } from '../types';

export interface ContentPlatformSelectorProps {
  value: ContentPlatformId[];
  onChange: (platforms: ContentPlatformId[]) => void;
  disabled?: boolean;
}

const PLATFORMS: Array<{ id: ContentPlatformId; label: string; color: string }> = [
  { id: 'tiktok', label: 'TikTok', color: 'bg-black text-white' },
  {
    id: 'instagram',
    label: 'Instagram',
    color: 'bg-gradient-to-r from-pink-500 to-purple-500 text-white',
  },
  { id: 'youtube', label: 'YouTube', color: 'bg-red-600 text-white' },
  { id: 'linkedin', label: 'LinkedIn', color: 'bg-blue-700 text-white' },
  { id: 'threads', label: 'Threads', color: 'bg-neutral-900 text-white' },
  { id: 'facebook', label: 'Facebook', color: 'bg-blue-600 text-white' },
  { id: 'xiaohongshu', label: 'Xiaohongshu', color: 'bg-red-500 text-white' },
  { id: 'shopee', label: 'Shopee', color: 'bg-orange-500 text-white' },
  { id: 'shopify', label: 'Shopify', color: 'bg-emerald-600 text-white' },
];

export function ContentPlatformSelector({
  value,
  onChange,
  disabled,
}: ContentPlatformSelectorProps) {
  const toggle = (id: ContentPlatformId) => {
    if (disabled) return;
    onChange(value.includes(id) ? value.filter(p => p !== id) : [...value, id]);
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      {PLATFORMS.map(p => {
        const selected = value.includes(p.id);
        return (
          <button
            key={p.id}
            type="button"
            disabled={disabled}
            onClick={() => toggle(p.id)}
            aria-pressed={selected}
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-opacity',
              p.color,
              !selected && 'opacity-40 hover:opacity-70',
              disabled && 'cursor-not-allowed'
            )}
          >
            {selected && <Check className="h-3 w-3" />}
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
