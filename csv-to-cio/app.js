'use strict';

// ------- Fitst things first --------------------------------------------------
// Load enviroment vars.
require('dotenv').config();

// ------- Imports -------------------------------------------------------------
const fs = require('fs');
const yargs = require('yargs');
const csv = require('csv-parser')

// ------- Args parse ----------------------------------------------------------

const argv = yargs
  .usage('Usage: node $0 <command> [options]')
  .alias('f', 'file')
  .nargs('f', 1)
  .describe('f', 'Load a file')
  .demandOption(['f'])
  .argv;

// ------- App bootstrap -------------------------------------------------------

const processRow = async (row) => {
  console.dir(row.id, { colors: true, showHidden: true });
}

fs.createReadStream(argv.file)
  .on('error', (e) => console.error(`Parse error | ${e}`))
  .pipe(csv({
    headers: ['id'],
    separator: ',',
  }))
  .on('data', processRow);

// ------- End -----------------------------------------------------------------
