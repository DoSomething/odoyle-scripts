const errors = {
  upBound: 'upBound limit reached.',
}

/**
 * MobileNumberGenerator - A poor man's mobile number generator implementation.
 */
class MobileNumberGenerator {
  constructor(prefix, upBound, lowBound) {
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
      throw new Error(errors.upBound);
    }
    this.state.count++;
    return `${this.prefix}${this.state.last++}`;
  }

  current() {
    return `${this.prefix}${this.state.last}`;
  }
}

module.exports = MobileNumberGenerator;
