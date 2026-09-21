export class FileEncryption {
  async encrypt(data: Uint8Array, key: CryptoKey): Promise<Uint8Array> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const input = new Uint8Array(data.byteLength);
    input.set(data);
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, input.buffer);
    const result = new Uint8Array(iv.length + encrypted.byteLength);
    result.set(iv);
    result.set(new Uint8Array(encrypted), iv.length);
    return result;
  }
}
