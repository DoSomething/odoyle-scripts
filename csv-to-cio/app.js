'use strict';

// ------- Fitst things first --------------------------------------------------
// Load enviroment vars.
require('dotenv').config();

// ------- Imports -------------------------------------------------------------
const fs = require('fs');
const yargs = require('yargs');
const parse = require('csv-parse');

// ------- Args parse ----------------------------------------------------------

const argv = yargs
  .usage('Usage: node $0 <command> [options]')
  .alias('f', 'file')
  .nargs('f', 1)
  .describe('f', 'Load a file')
  .demandOption(['f'])
  .argv;

// ------- App bootstrap -------------------------------------------------------

const processRow = async (err, data) => {
  console.dir(data, { colors: true, showHidden: true });
}

const parser = parse({}, processRow);

fs.createReadStream(argv.file)
  .on('error', (e) => console.error(`Parse error | ${e}`))
  .pipe(parser);

// ------- End -----------------------------------------------------------------
