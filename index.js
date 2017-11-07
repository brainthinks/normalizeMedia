#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const utils = require('./utils/');
// const dashcam = require('./src/dashcam');
const { normalizeAudiobooks } = require('./src/audible');

async function main (activationBytes, rawSourceDirectory, rawDestinationDirectory) {
  if (!rawSourceDirectory) {
    throw new Error('You need to tell me where the files you want to convert are located.');
  }

  // Get the absolute path to the source directory
  const sourceDirectory = path.resolve(rawSourceDirectory);

  // Ensure that the source directory exists, and that we can read and write to it
  await utils.async.toPromise(
    fs.access,
    sourceDirectory,
    fs.constants.R_OK | fs.constants.W_OK
  );

  let destinationDirectory;

  if (rawDestinationDirectory) {
    destinationDirectory = path.resolve(rawDestinationDirectory);

    // Ensure that the source directory exists, and that we can read and write to it
    await utils.async.toPromise(
      fs.access,
      destinationDirectory,
      fs.constants.R_OK | fs.constants.W_OK
    );
  }

  await normalizeAudiobooks(activationBytes, sourceDirectory, destinationDirectory);
}

main(...utils.getArgs())
  .then(() => {
    console.log('\n------------------\n');
    console.log('Successfully normalized your dashcam videos!!');
    console.log('\n------------------\n');
    process.exit();
  })
  .catch((err) => {
    console.log('\n------------------\n');
    console.log('Normalize Failed!!');
    console.log('\n------------------\n');
    console.log(err);
    console.log('\n------------------\n');
    process.exit(1);
  });
