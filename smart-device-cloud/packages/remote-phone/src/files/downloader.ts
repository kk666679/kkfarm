import type { FileTransfer, RemoteSession } from '../types';

export class RemoteFileDownloader {
  async download(session: RemoteSession, path: string, sizeBytes: number): Promise<FileTransfer> {
    if (!session.permissions.includes('files')) throw new Error('File permission denied');
    if (!path.startsWith('/') || path.includes('..')) throw new Error('Invalid remote file path');
    const transfer: FileTransfer = {
      id: `transfer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sessionId: session.id,
      direction: 'download',
      path,
      sizeBytes,
      status: 'transferring',
      createdAt: new Date().toISOString(),
    };
    await Promise.resolve();
    return { ...transfer, status: 'completed', completedAt: new Date().toISOString() };
  }
}
