'use strict';

const async = require('./async');
const childProcess = require('./childProcess');
const fs = require('./fs');

/**
 * Get all arguments that were passed to the currently executing node process.
 *
 * @return {array}
 */
function getArgs () {
  const [ , , ...args ] = process.argv;

  return args;
};

module.exports = {
  getArgs,
  async,
  childProcess,
  fs,
};
