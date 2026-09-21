import type { Recording } from '../types';

export class RecordingStorage {
  private readonly paths = new Map<string, string>();

  save(recording: Recording, path: string): void {
    if (!path.startsWith('/recordings/') || recording.status !== 'stopped')
      throw new Error('Invalid recording storage target');
    this.paths.set(recording.id, path);
  }

  get(recordingId: string): string | undefined {
    return this.paths.get(recordingId);
  }
}
