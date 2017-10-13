/**
 * MobileNumberGenerator - A poor man's mobile number generator implementation.
 * TODO: Refactor using ES6 generator function
 */
class MobileNumberGenerator {
  constructor(prefix, lowBound, upBound) {
    this.prefix = prefix || '+1555';
    this.lowBound = lowBound || 1111110;
    this.upBound = upBound || 2111110;
    this.state = {
      last: this.lowBound,
      count: 0,
    };
  }

  next() {
    if (this.state.last === this.upBound) {
      return 'MAX_REACHED';
    }
    this.state.count++;
    return `${this.prefix}${this.state.last++}`;
  }

  getCurrent() {
    return `${this.prefix}${this.state.last}`;
  }

  getCount() {
    return this.state.count;
  }
}

module.exports = new MobileNumberGenerator();
