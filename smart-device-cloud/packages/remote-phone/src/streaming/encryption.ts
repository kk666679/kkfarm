export class StreamEncryption {
  async seal(plaintext: Uint8Array, key: CryptoKey): Promise<Uint8Array> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const input = new Uint8Array(plaintext.byteLength);
    input.set(plaintext);
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, input.buffer);
    const output = new Uint8Array(iv.length + ciphertext.byteLength);
    output.set(iv);
    output.set(new Uint8Array(ciphertext), iv.length);
    return output;
  }
}
