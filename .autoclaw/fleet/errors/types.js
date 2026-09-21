export class FleetError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'FleetError';
    this.code = code;
  }
}

export class SeatError extends FleetError {
  constructor(message) {
    super(message, 'SEAT_ERROR');
    this.name = 'SeatError';
  }
}

export class ElectionError extends FleetError {
  constructor(message) {
    super(message, 'ELECTION_ERROR');
    this.name = 'ElectionError';
  }
}

export class FederationError extends FleetError {
  constructor(message) {
    super(message, 'FEDERATION_ERROR');
    this.name = 'FederationError';
  }
}
