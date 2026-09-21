export class ProtocolError extends Error {
  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'ProtocolError';
  }
}

export class CommandNotAllowedError extends ProtocolError {
  constructor(action: string) {
    super(`Command not allowed: ${action}`, 'COMMAND_NOT_ALLOWED');
  }
}

export class InvalidCommandError extends ProtocolError {
  constructor(message: string) {
    super(message, 'INVALID_COMMAND');
  }
}

export class DeviceNotFoundError extends ProtocolError {
  constructor(deviceId: string) {
    super(`Device not found: ${deviceId}`, 'DEVICE_NOT_FOUND');
  }
}

export class DeviceOfflineError extends ProtocolError {
  constructor(deviceId: string) {
    super(`Device is offline: ${deviceId}`, 'DEVICE_OFFLINE');
  }
}

export class PermissionDeniedError extends ProtocolError {
  constructor(required: string, action: string) {
    super(`Permission denied: requires '${required}' for '${action}'`, 'PERMISSION_DENIED');
  }
}

export type ProtocolErrorCode =
  | 'COMMAND_NOT_ALLOWED'
  | 'INVALID_COMMAND'
  | 'DEVICE_NOT_FOUND'
  | 'DEVICE_OFFLINE'
  | 'PERMISSION_DENIED'
  | 'PROTOCOL_ERROR';
