export class ControlState {
  constructor() {
    this.state = 'running';
    this.lastTransition = Date.now();
  }

  transition(newState) {
    const previous = this.state;
    this.state = newState;
    this.lastTransition = Date.now();
    return { from: previous, to: newState, timestamp: this.lastTransition };
  }
}
