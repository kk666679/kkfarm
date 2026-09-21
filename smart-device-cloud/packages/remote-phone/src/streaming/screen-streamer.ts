import type { RemoteSession, ScreenFrame, StreamQuality } from '../types';

export interface ScreenStreamerOptions {
  width: number;
  height: number;
  fps: number;
}

export class ScreenStreamer {
  private sequence = 0;

  constructor(private readonly options: ScreenStreamerOptions) {}

  nextFrame(session: RemoteSession, data = 'frame'): ScreenFrame {
    if (!session.active) throw new Error('Remote session is not active');
    this.sequence += 1;
    session.lastActive = new Date().toISOString();
    return {
      sequence: this.sequence,
      width: this.options.width,
      height: this.options.height,
      mimeType: 'image/jpeg',
      data,
      capturedAt: new Date().toISOString(),
    };
  }

  qualityFor(session: RemoteSession): StreamQuality {
    return session.quality;
  }
}
