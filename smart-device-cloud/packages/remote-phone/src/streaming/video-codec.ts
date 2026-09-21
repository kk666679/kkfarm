export type VideoCodec = 'h264' | 'vp8' | 'vp9';

export interface CodecProfile {
  codec: VideoCodec;
  bitrateKbps: number;
  framerate: number;
}

export class VideoCodecSelector {
  select(available: readonly VideoCodec[], bandwidthKbps: number): CodecProfile {
    if (available.includes('h264'))
      return {
        codec: 'h264',
        bitrateKbps: bandwidthKbps >= 2000 ? 2000 : Math.max(300, bandwidthKbps),
        framerate: bandwidthKbps >= 1500 ? 30 : 15,
      };
    if (available.includes('vp9'))
      return { codec: 'vp9', bitrateKbps: Math.max(300, bandwidthKbps), framerate: 24 };
    if (available.includes('vp8'))
      return { codec: 'vp8', bitrateKbps: Math.max(300, bandwidthKbps), framerate: 15 };
    throw new Error('No supported video codec');
  }
}
