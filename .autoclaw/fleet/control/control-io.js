export class ControlIO {
  async read() {
    return Buffer.from('');
  }

  async write(data) {
    return data.length;
  }
}
