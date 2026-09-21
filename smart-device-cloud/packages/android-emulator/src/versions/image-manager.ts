import type { EmulatorImage, EmulatorImageStatus } from '../types';

export class ImageManager {
  private readonly images = new Map<string, EmulatorImage>();

  add(image: EmulatorImage): void {
    this.images.set(image.id, { ...image });
  }

  updateStatus(id: string, status: EmulatorImageStatus): EmulatorImage {
    const image = this.images.get(id);
    if (!image) throw new Error(`Emulator image not found: ${id}`);
    const updated = { ...image, status };
    this.images.set(id, updated);
    return updated;
  }

  get(id: string): EmulatorImage | undefined {
    const image = this.images.get(id);
    return image ? { ...image } : undefined;
  }

  list(): EmulatorImage[] {
    return Array.from(this.images.values()).map(image => ({ ...image }));
  }
}
