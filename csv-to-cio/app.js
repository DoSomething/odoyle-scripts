'use strict';

// ------- Fitst things first --------------------------------------------------
// Load enviroment vars.
require('dotenv').config();

// ------- Imports -------------------------------------------------------------
const fs = require('fs');
const yargs = require('yargs');
const csv = require('csv-parser')
require('isomorphic-fetch');

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
  let result;
  try {
    result = await getNorthstarUser(row.id);
  } catch (e) {
    console.error(`Can't process ${row.id}: ${e}`);
    return;
  }

  console.dir(result, { colors: true, showHidden: true });
}

const getNorthstarUser = async (id) => {
  let result;
  try {
    const response = await fetch(
      `${process.env.DS_NORTHSTAR_API_BASEURI}/users/id/${id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.DS_NORTHSTAR_API_KEY}`
        }
      }
    );
    result = await response.json();
  } catch (e) {
    throw new Error(`Northstar error: ${e}`);
  }
  if (result.error) {
    throw new Error(`Northstar response: ${result.error.message}`);
  }
  return result.data;
}

fs.createReadStream(argv.file)
  .on('error', (e) => console.error(`Parse error | ${e}`))
  .pipe(csv({
    headers: ['id'],
    separator: ',',
  }))
  .on('data', processRow);

// ------- End -----------------------------------------------------------------
