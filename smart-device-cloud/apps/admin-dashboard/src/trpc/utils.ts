export function getBaseUrl(): string {
  if (typeof window !== 'undefined') return '';
  if (import.meta.env.VITE_VERCEL_URL) return `https://${import.meta.env.VITE_VERCEL_URL}`;
  return 'http://localhost:3000';
}
