import type { Recording, RemoteSession } from '../types';

export class RemoteRecorder {
  private readonly recordings = new Map<string, Recording>();

  start(session: RemoteSession): Recording {
    if (!session.permissions.includes('record')) throw new Error('Record permission denied');
    const recording: Recording = {
      id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sessionId: session.id,
      status: 'recording',
      startedAt: new Date().toISOString(),
    };
    this.recordings.set(recording.id, recording);
    return { ...recording };
  }

  stop(id: string, path: string): Recording {
    const recording = this.recordings.get(id);
    if (!recording || recording.status !== 'recording')
      throw new Error(`Recording is not active: ${id}`);
    const stopped: Recording = {
      ...recording,
      status: 'stopped',
      stoppedAt: new Date().toISOString(),
      path,
    };
    this.recordings.set(id, stopped);
    return { ...stopped };
  }
}
