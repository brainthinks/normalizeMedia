'use strict';

const mvLib = require('mv');
const mkdirpLib = require('mkdirp');

const async = require('./async');

function sanitizeFileName(fileName) {
  // https://serverfault.com/a/776229
  const invalidCharacters = /[\/\\:\*\?\"\<\>\|\x01-\x1F\x7F]/g;
  const reservedWindowsFileNames = /^(nul|prn|con|lpt[0-9]|com[0-9]|aux)(\.|$)/i;
  const startsWithDots = /^\.+/;
  const endsWithDots = /\.+$/;

  return fileName
    .replace(invalidCharacters, ' - ')
    .replace(reservedWindowsFileNames, '')
    .replace(startsWithDots, '')
    .replace(endsWithDots, '')
    .replace('  ', ' ');
}

async function mv (...args) {
  return async.toPromise(mvLib, ...args);
}

async function mkdirp (...args) {
  return async.toPromise(mkdirpLib, ...args);
}

module.exports = {
  sanitizeFileName,
  mv,
  mkdirp,
};
