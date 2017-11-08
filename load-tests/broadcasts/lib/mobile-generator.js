/**
 * MobileNumberGenerator - A poor man's mobile number generator implementation.
 * TODO: Refactor using ES6 generator function
 */
class MobileNumberGenerator {
  constructor(prefix, lowBound, upBound) {
    this.prefix = prefix || '+1555';
    this.lowBound = lowBound || 1111110;
    this.upBound = upBound || 9111110;
    this.state = {
      next: this.lowBound,
      count: 0,
      limitReached: false,
    };
  }

  next() {
    if (this.state.last === this.upBound) {
      this.state.limitReached = true;
      return 'MAX_REACHED';
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
