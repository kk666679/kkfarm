import type { FileTransfer, RemoteSession } from '../types';

export class RemoteFileUploader {
  async upload(session: RemoteSession, path: string, sizeBytes: number): Promise<FileTransfer> {
    this.require(session, 'files');
    if (!path.startsWith('/') || path.includes('..')) throw new Error('Invalid remote file path');
    return this.transfer(session, 'upload', path, sizeBytes);
  }

  private require(session: RemoteSession, permission: 'files'): void {
    if (!session.permissions.includes(permission)) throw new Error('File permission denied');
  }

  private async transfer(
    session: RemoteSession,
    direction: 'upload' | 'download',
    path: string,
    sizeBytes: number
  ): Promise<FileTransfer> {
    const transfer: FileTransfer = {
      id: `transfer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sessionId: session.id,
      direction,
      path,
      sizeBytes,
      status: 'transferring',
      createdAt: new Date().toISOString(),
    };
    await Promise.resolve();
    return { ...transfer, status: 'completed', completedAt: new Date().toISOString() };
  }
}
