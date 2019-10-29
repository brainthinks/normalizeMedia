#!/usr/bin/env node
'use strict';

const args = require('yargs').array('mkvs').parse();
const { mkv2portable } = require('../src/audible');

const destination = args.destination;
const mkvs = args.mkvs;

async function main () {
  if (!destination) {
    throw new Error('destination was empty!');
  }

  if (!mkvs || !mkvs.length) {
    throw new Error('need mkvs to convert!');
  }

  for (let i = 0; i < mkvs.length; i++) {
    const mkvPath = mkvs[i];

    await mkv2portable(mkvPath, destination);
  }
}

main()
  .then(() => {
    console.log(`Successfully converted ${mkvs.length} mkvs.`);
    console.log(`Portable audiobooks were written to ${destination}`);
    process.exit();
  })
  .catch((error) => {
    console.error('mkv conversion failed!');
    console.error(error);
    process.exit(1);
  });
