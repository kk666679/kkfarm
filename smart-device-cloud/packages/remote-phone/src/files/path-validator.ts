export function validateRemotePath(path: string): string {
  const normalized = path.trim();
  if (!normalized.startsWith('/') || normalized.split('/').includes('..'))
    throw new Error('Invalid remote path');
  return normalized;
}
