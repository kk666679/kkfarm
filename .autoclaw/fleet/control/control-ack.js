export class ControlAck {
  ack(commandId) {
    return { commandId, acked: true, timestamp: Date.now() };
  }
}
