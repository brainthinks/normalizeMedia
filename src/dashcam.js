'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const utils = require('../utils/');

const DASHCAM_FILE_EXT_LC = process.env.NODE_DASHCAM_FILE_EXT_LC || '.mov';
const FFMPEG_BIN = process.env.NODE_FFMPEG_BIN || 'ffmpeg';
const LOGGER = console;

/**
 * Convert ALL mov files to mkv files in a given directory.
 *
 * @param  {[type]}
 * @return {[type]}
 */
async function mov2mkv (sourceDirectory) {
  // Get the names of all files that are dashcam videos
  const dashcamFiles = (await utils.async.toPromise(fs.readdir, sourceDirectory))
    .filter((fileName) => path.extname(fileName).toLowerCase() === DASHCAM_FILE_EXT_LC);

  await utils.async.forEachAsyncSeries(dashcamFiles, (fileName) => new Promise((resolve, reject) => {
    // Structure the ffmpeg command
    // @todo - should any of the commands here be configurable?  Should a custom command be allowed?
    const command = FFMPEG_BIN;
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
      LOGGER.log(`info: ${data}`);
    });

    converter.stderr.on('data', (data) => {
      LOGGER.error(`error: ${data}`);
    });

    converter.on('close', (code) => {
      if (code === 0) {
        LOGGER.log('\n------------------\n');
        LOGGER.log(`finish: child process exited with code ${code}`);
        LOGGER.log(`Successfully converted ${fileName}!`)
        LOGGER.log('\n------------------\n');
        return resolve();
      }

      LOGGER.log('\n------------------\n');
      LOGGER.log(`finish error: child process exited with code ${code}`);
      LOGGER.log(`FAILED to convert ${fileName}!`)
      LOGGER.log('\n------------------\n');
      reject(`finish error: child process exited with code ${code}`);
    });

    converter.on('error', (code) => {
      LOGGER.log(`unfinished error: child process exited with code ${code}`);
      reject(`child process exited with code ${code}`);
    });
  }));
}

module.exports = {
  mov2mkv,
};
