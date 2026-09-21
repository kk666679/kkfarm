import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(
  ...inputs: (string | number | boolean | undefined | null | Record<string, boolean>)[]
): string {
  return twMerge(clsx(inputs));
}
