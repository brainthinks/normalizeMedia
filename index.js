#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const utils = require('./utils/');

/**
 * Convert ALL mov files to mkv files in a given directory.
 *
 * @param  {[type]}
 * @return {[type]}
 */
async function main (rawSourceDirectory) {
  if (!rawSourceDirectory) {
    throw new Error('You must provide a source directory.');
  }

  // Get the absolute path to the source directory
  const sourceDirectory = path.resolve(rawSourceDirectory);

  // Ensure that the source directory exists, and that we can read and write to it
  await utils.toPromise(
    fs.access,
    sourceDirectory,
    fs.constants.R_OK | fs.constants.W_OK
  );

  // Get the names of all files that are dashcam videos
  const dashcamFiles = (await utils.toPromise(fs.readdir, sourceDirectory))
    .filter((fileName) => path.extname(fileName).toLowerCase() === '.mov');

  await utils.forEachAsyncSeries(dashcamFiles, (fileName) => new Promise((resolve, reject) => {
    // Structure the ffmpeg command
    const command = 'ffmpeg';
    const commandArgs = [
      '-i', fileName,
      // We don't need to change the audio or video stream
      '-c:v', 'copy',
      '-c:a', 'copy',
      `${path.basename(fileName, path.extname(fileName))}.mkv`,
    ];

    const commandOptions = {
      // Ensure we are working in the correct directory
      cwd: sourceDirectory,
    };

    // Execute the conversion command
    const converter = spawn(command, commandArgs, commandOptions);

    converter.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    converter.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });

    converter.on('close', (code) => {
      if (code === 0) {
        console.log('\n------------------\n');
        console.log(`close: child process exited with code ${code}`);
        console.log(`Successfully converted ${fileName}!`)
        console.log('\n------------------\n');
        return resolve();
      }

      console.log('\n------------------\n');
      console.log(`close: child process exited with code ${code}`);
      console.log(`FAILED to convert ${fileName}!`)
      console.log('\n------------------\n');
      reject(`close: child process exited with code ${code}`);
    });

    converter.on('error', (code) => {
      console.log(`error: child process exited with code ${code}`);
      reject(`child process exited with code ${code}`);
    });
  }));
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
