import type { Recording } from '../types';

export class RecordingPlayback {
  play(recording: Recording): { recordingId: string; status: 'playing' } {
    if (recording.status !== 'stopped' || !recording.path)
      throw new Error('Recording is not ready for playback');
    return { recordingId: recording.id, status: 'playing' };
  }
}
