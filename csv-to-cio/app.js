'use strict';

// ------- Fitst things first --------------------------------------------------
// Load enviroment vars.
require('dotenv').config();

// ------- Imports -------------------------------------------------------------
const yargs = require('yargs');

// ------- Args parse ----------------------------------------------------------

const argv = yargs
  .usage('Usage: node $0')
  .help()
  .argv;

// ------- App bootstrap -------------------------------------------------------

// const [command] = argv._;


// ------- End -----------------------------------------------------------------
