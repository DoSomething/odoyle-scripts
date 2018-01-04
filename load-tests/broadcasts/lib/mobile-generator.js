/**
 * MobileNumberGenerator - A poor man's mobile number generator implementation.
 * TODO: Refactor using ES6 generator function
 */
class MobileNumberGenerator {
  constructor() {
    this.prefix = '+1555';
    // 8 Million numbers by default. From +15551111110 to +15559111110 (Inclusive).
    // TODO: Use a config to set these hardcoded values
    this.lowBound = 1111110;
    this.upBound = 9111110;
    this.state = {
      next: this.lowBound,
      count: 0,
      limitReached: false,
    };
  }

  next() {
    if (this.state.next > this.upBound) {
      this.state.limitReached = true;
      return false;
    }
    this.state.count++;
    return `${this.prefix}${this.state.next++}`;
  }

  getLast() {
    return `${this.prefix}${this.state.next-1}`;
  }

  getCount() {
    return this.state.count;
  }

  isLimitReached() {
    return this.state.limitReached;
  }
}

module.exports = new MobileNumberGenerator();
