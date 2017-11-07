# Normalize Media

A series of utilities for working with the types of media that I have.  This includes:

1. audible audiobooks
1. dashcam videos


## Requirements

### Supported Operating Systems

1. Linux (tested on Linux Mint)
1. Windows (tested on Windows 7)
1. MacOS (untested, but may work)


### Install Node

You will need to install node `>= 8.x.x`.  I recommend using `n` - [https://github.com/tj/n](https://github.com/tj/n) if you're on linux.  If you're on windows, you can just use the version directly from nodejs.org - [https://nodejs.org/en/download/](https://nodejs.org/en/download/).


### Install FFMPEG

For Ubuntu or Linux Mint:

`sudo apt-get install ffmpeg`


For Windows:

You will need to download [FFMPEG](https://www.ffmpeg.org/) and extract it.  Here are some decent instructions to get it on your `PATH`: [https://github.com/adaptlearning/adapt_authoring/wiki/Installing-FFmpeg](https://github.com/adaptlearning/adapt_authoring/wiki/Installing-FFmpeg).  I also made a video tutorial for this step: (https://www.youtube.com/watch?v=prSOkqHXwg0)[https://www.youtube.com/watch?v=prSOkqHXwg0].  After watching that video, here is the actual command I used (note - you need to replace `[user]` with your username):

`setx /m PATH "C:\Users\[user]\Apps\ffmpeg\bin;%PATH%"`


### Install mkvtoolnix

For Ubuntu or Linux Mint:

`sudo apt-get install mkvtoolnix`


For Windows:

Download and install: [https://mkvtoolnix.download/downloads.html#windows](https://mkvtoolnix.download/downloads.html#windows).  Note that you will need to add this to your path as well.  I recommend you watch the FFMPEG video above for information about what this means and how to do it.  Here is the command you will need to add the mkvtoolnix executables to your pat`PATH` (remember to open a cmd window with administrative privileges):

`setx /m PATH "C:\Program Files\MKVToolNix;%PATH%"`


## Getting Started

With a terminal open, follow these steps.

First, clone this repository on your computer using git or by downloading this project and extracting it.

Next, `cd` into the directory that contains this project.  For example:

`cd ~/Downloads/normalizeMedia // Linux`

`cd C:\Users\[your user name]\Downloads\normalizeMedia // Windows`

Next, you will need to install the npm dependencies:

`npm i`

Note that as of right now, you need to have `ffmpeg` and `mkvinfo` on your `PATH`.  In the future, I will implement support for being able to specify the locations of the executables these scripts need, but for now, they must exist on the `PATH`.  See the `Requirements` section above.

You can check to see if `ffmpeg` is already on your path by typing `ffmpeg` into a terminal.  If you see the ffmpeg help information, ffmpeg has been found.  Do the same with `mkvinfo`.

You're now ready to start.  See the `Use` section below for information on actually normalizing some media.


# Use

Note that you can run any of the below `npm` script commands with no arguments to get help for that command.


### Convert Encrypted Audible Audiobooks

The audiobooks that I own come from audible as .aax files.  These files are encrypted, so they will not run in normal media players.  In order to decrypt your own property so you can use it as you see fit, you will need to retrieve your `activation_bytes` from audible/amazon.  In order to this, you will need to download and run [inAudible-NG's audible-activator](https://github.com/inAudible-NG/audible-activator).  Once you have your `activation_bytes`, you are ready to continue.

To normalize your audiobooks, I expect the following:

1. your `activation_bytes` from audible-activator
1. the folder that contains your .aax files
1. the folder where you'd like me to put your normalized files

I need the `activation_bytes` to decrypt your .aax files.  At first, I will create the decrypted .mkv file in the directory that contains your .aax file.  Once the decryption is finished, I will place your .aax file in a `_aax_backups` folder, and move the decrypted .mkv file to a `_mkv_backups` folder.  This .mkv file is a decrypted "virgin" copy of your .aax file, meaning it retains the cover art, author information, and chapters, just like the original .aax file. - I suggest you keep it, but you are free to delete both the .aax file and the .mkv file once the script finishes.  Next, I will create one .mp3 file per chapter.  Note that the chapters are defined by audible/amazon, and may not truly reflect the book's chapter breaks.  Each .mp3 file will have the metadata necessary to display the author, chapter, and book title in any media player that can read ID3v2 tags (which should be all of them).  Each .mp3 file will also retain the embedded cover art.  I will also generate the cover art as a standalone file.  This .jpeg file is then copied to folder.jpg and cover.jpg to be compatible with most media players, in case they cannot read the embedded image in the .mp3 file.  Finally, I will create a .m3u playlist file, which contains all of the book chapters in order.

Once this is done, your audiobook is what I consider "normalized" - all of your .aax files are in one place, and merely serve as backups, though it is unlikely that you will ever need them again as long as you save the .mkv versions.  A perfect decrypted copy of these .aax files are saved as .mkv files, and serve as the untouched backup of your audiobook.  Storage is pretty cheap these days, so I recommend you keep these files.  Finally, there is one folder per author, and in each author folder, there is one folder per book by that author.  The individual book folders contain the audiobook as multiple .mp3 files, one per chapter.  There is a playlist file that contains all chapters in order, so you do not have to manually add each chapter to your media player.  Finally, there is the cover art image saved as a .jpeg file, named with the author and book title.  This image is copied to folder.jpg and cover.jpg to increase the number of media players that the cover art can be compatible with.  Each file and folder name created by my script is meant to be compatible with both Linux and Windows systems, so any non-compatible names are sanitized.  The resulting "portable" folders are now compatible with most, if not all media players, in an intuitive way.  

I specifically targed the android app Voice ([https://github.com/PaulWoitaschek/Voice](https://github.com/PaulWoitaschek/Voice)), which is available on the Google Play Store and FDroid, because I listen to these audiobooks in my car, and playing them on a small tablet is the best way I have found to reliably play media in my car.  The portable folders work intuitively with Voice with no modifications.

Linux:

`npm run normalize activation_bytes /path/to/aax/files /path/to/put/normalized/files`

Windows:

`node index.js activation_bytes /path/to/aax/files /path/to/put/normalized/files`


### Convert Dashcam Videos

`@todo`


## TODO

1. implement command line args so that more than just audiobooks can be normalized
1. implement ability to 
1. create utils as a separate package, or maybe each individual utils category as its own package
1. eslint
1. tests
1. ~ require module
