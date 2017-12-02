'use strict';

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const uuid = require('uuid');

const utils = require('../utils/');

const AAX_FILE_EXT_LC = '.aax';
const FFMPEG_BIN = process.env.NODE_FFMPEG_BIN || 'ffmpeg';
const MKVINFO_BIN = process.env.NODE_MKVINFO_BIN || 'mkvinfo';
const LOGGER = console;

function generateBaseFileName (mkvInfo) {
  return utils.fs.sanitizeFileName(`${mkvInfo.author} - ${mkvInfo.title}`);
}

async function mkvGetInfo (mkvPath) {
  let rawOutput = '';

  let author;
  let title;
  const chapters = [];

  const runner = new utils.childProcess.Runner(MKVINFO_BIN, [ mkvPath ]);

  runner.on('stdout', (data) => {
    rawOutput += data;
  });

  // Wait for the runner to finish
  await runner.run().promise;

  // Make the output easier to work with
  const rawLines = rawOutput.split('\n');
  // console.log(rawLines)

  // We need to keep track of the chapter we're currently parsing
  let currentUIDIndex = -1;

  // Parse the mkv info to get what we need
  // @todo - change these to slice, since we know the exact characters we're
  // looking for
  for (let i = 0; i < rawLines.length; i++) {
    const trimmedLine = rawLines[i].slice(1).trim();

    if (trimmedLine === '+ Name: ALBUM_ARTIST') {
      // advance the counter because we need the next line
      i++;
      author = rawLines[i].slice(1).trim().split('String:')[1].trim();
    }

    if (trimmedLine === '+ Name: ALBUM') {
      // advance the counter because we need the next line
      i++;
      title = rawLines[i].slice(1).trim().split('String:')[1].trim();
    }

    if (trimmedLine.startsWith('+ ChapterUID:')) {
      currentUIDIndex++;
      chapters.push({
        uid: trimmedLine.split(':')[1].trim(),
      });
    }

    if (trimmedLine.startsWith('+ ChapterTimeStart:')) {
      chapters[currentUIDIndex].start = trimmedLine.split(': ')[1].trim();
    }

    if (trimmedLine.startsWith('+ ChapterTimeEnd:')) {
      chapters[currentUIDIndex].end = trimmedLine.split(': ')[1].trim();
    }

    if (trimmedLine.startsWith('+ ChapterString:')) {
      chapters[currentUIDIndex].name = trimmedLine.split('ChapterString:')[1].trim();
    }
  }

  // Set defaults
  if (!author) {
    author = 'Unknown';
  }

  if (!title) {
    title = 'Unknown';
  }

  const mkvInfo = {
    author,
    title,
    chapters,
  };

  return mkvInfo;
}

async function aax2mkv (activationBytes, sourcePath, destinationDirectory) {
  const mkvTempPath = `${path.join(destinationDirectory, uuid.v1())}.mkv`;

  const runner = new utils.childProcess.Runner(
    FFMPEG_BIN,
    [
      '-hide_banner',
      '-activation_bytes', activationBytes,
      '-y',
      '-i', sourcePath,
      // keep the picture, since some players can display it
      '-c:v', 'copy',
      '-c:a', 'copy',
      // don't copy the subtitles
      '-sn',
      mkvTempPath,
    ]
  );

  await runner.run().promise;

  const mkvInfo = await mkvGetInfo(mkvTempPath);

  // make a backup of the aax file
  const aaxPath = path.join(destinationDirectory, '_aax_backups', path.basename(sourcePath));
  await utils.fs.mv(sourcePath, aaxPath, { mkdirp: true });

  // move the mkv to a backup directory
  const mkvPath = path.join(destinationDirectory, '_mkv_backups', `${generateBaseFileName(mkvInfo)}.mkv`);
  await utils.fs.mv(mkvTempPath, mkvPath, { mkdirp: true });

  return {
    aaxPath,
    mkvPath,
    mkvInfo,
  };
}

async function mkv2jpeg (mkvPath, destinationDirectory, mkvInfo) {
  const jpegPath = `${path.join(destinationDirectory, generateBaseFileName(mkvInfo))}.jpeg`;

  const runner = new utils.childProcess.Runner(
    FFMPEG_BIN,
    [
      '-hide_banner',
      '-y',
      '-i', mkvPath,
      // copy the picture
      '-c:v', 'copy',
      // don't copy the audio
      '-an',
      // don't copy the subtitles
      '-sn',
      jpegPath,
    ],
    {
      // Ensure we are working in the correct directory
      cwd: destinationDirectory,
    }
  );

  await runner.run().promise;

  // some players only respect folder.jpg and cover.jpg
  await utils.async.toPromise(fs.copyFile, jpegPath, `${path.join(destinationDirectory, 'folder.jpg')}`);
  await utils.async.toPromise(fs.copyFile, jpegPath, `${path.join(destinationDirectory, 'cover.jpg')}`);

  return jpegPath;
}

async function mkv2mp3 (mkvPath, jpegPath, destinationDirectory, mkvInfo) {
  const playlistPath = path.join(destinationDirectory, `${generateBaseFileName(mkvInfo)}.m3u`);

  await utils.async.toPromise(
    fs.writeFile,
    playlistPath,
    '#EXTM3U\n' // vlc puts this at the top of the playlist it generates
  );

  await utils.async.forEachAsyncSeries(mkvInfo.chapters, async (chapter) => {
    const mp3FileName = `${chapter.name}.mp3`;

    LOGGER.log(`Creating ${mp3FileName}`);

    const runner = new utils.childProcess.Runner(
      FFMPEG_BIN,
      [
        '-y',
        '-hide_banner',
        // order matters!
        '-i', jpegPath, // add the cover art directly to the mp3
        '-i', mkvPath,
        '-ss', chapter.start,
        '-to', chapter.end,
        // map stuff needed for cover art.  also, I think in this order, the
        // metadata from the mkv isn't copied over, which is good.
        '-map_metadata', '0',
        '-map', '0',
        '-map', '1',
        '-metadata', `title=${chapter.name}`,
        '-metadata', `artist=${mkvInfo.author}`,
        '-metadata', `album=${mkvInfo.title}`,
        '-metadata', `genre=audiobook`,
        // make the mp3s 128kbps
        '-c:a', 'libmp3lame',
        '-b:a', '128k',
        // fix timestamp issues
        // https://trac.ffmpeg.org/wiki/Seeking#Cuttingsmallsections
        '-avoid_negative_ts', '1',
        // Support Windows Media Player, barf
        // https://answers.microsoft.com/en-us/windows/forum/windows_7-pictures/how-to-add-id3v24-support-for-windows-7-64bit/a9427521-eb6f-4fe4-affb-f61532846503?auth=1
        '-id3v2_version', '3',
        // don't copy the subtitles
        '-sn',
        // copy the cover art
        '-c:v', 'copy',
        mp3FileName,
      ],
      {
        // Ensure we are working in the correct directory
        cwd: destinationDirectory,
      }
    );

    runner.on('stdout', () => {});
    runner.on('stderr', () => {});

    await runner.run().promise;

    await utils.async.toPromise(
      fs.appendFile,
      playlistPath,
      `./${mp3FileName}\n`
    );

    LOGGER.log(`Finished Creating ${mp3FileName}`);
  });
}

async function mkv2portable (mkvPath, destinationDirectory, mkvInfo) {
  if (!mkvInfo) {
    mkvInfo = await mkvGetInfo(mkvPath);
  }

  const portableDirectory = path.join(
    destinationDirectory,
    utils.fs.sanitizeFileName(mkvInfo.author),
    utils.fs.sanitizeFileName(mkvInfo.title),
  );

  await utils.fs.mkdirp(portableDirectory);

  const jpegPath = await mkv2jpeg(mkvPath, portableDirectory, mkvInfo);

  await mkv2mp3(mkvPath, jpegPath, portableDirectory, mkvInfo);
}

async function normalizeAudiobooks (activationBytes, sourceDirectory, destinationDirectory = sourceDirectory) {
  const aaxFiles = (await utils.async.toPromise(fs.readdir, sourceDirectory))
    .filter((fileName) => path.extname(fileName).toLowerCase() === AAX_FILE_EXT_LC);

  await utils.async.forEachAsyncSeries(aaxFiles, async (sourceFileName) => {
    const sourcePath = path.join(sourceDirectory, sourceFileName);

    const {
      mkvPath,
      mkvInfo,
    } = await aax2mkv(activationBytes, sourcePath, destinationDirectory);

    // At this point, the audiobooks are normalized, and work fine on a computer,
    // but they aren't particularly useful.  Let's make them portable.
    await mkv2portable(mkvPath, destinationDirectory, mkvInfo);
  });
}

module.exports = {
  generateBaseFileName,
  mkvGetInfo,
  aax2mkv,
  mkv2jpeg,
  mkv2mp3,
  mkv2portable,
  normalizeAudiobooks,
};
