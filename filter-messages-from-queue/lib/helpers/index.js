
const camelCase = require('camelcase');
const filters = require('../../filters');

module.exports = {
  warn: (cb) => {
    let count = 10;
    console.log('IMPORTANT Running this script is highly destructive IF not used properly. Read de README.');
    console.log('Run with .env variable DRY_RUN=true if this is the first time.');
    const interval = setInterval(function () {
      if (count) {
        console.log(count--);
      }else {
        console.log(count);
        clearInterval(interval);
        cb();
      }
    }, 1000);
    return console.log('Cancel with Ctrl-C if unsure.');
  },
  getFilter: (userInput) => {
    if (!userInput) throw new Error('Filter name must not be empty.');
    const filterName = camelCase(userInput);
    return filters[filterName];
  }
}
