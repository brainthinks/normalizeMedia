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

You will need to install node `>= 8.x.x`.  I recommend using `n` - [https://github.com/tj/n](https://github.com/tj/n).


### Install FFMPEG

For Ubuntu or Linux Mint:

`sudo apt-get install ffmpeg`


For Windows:

You will need to download [FFMPEG](https://www.ffmpeg.org/) and extract it.  Here are some decent instructions to get it on your `PATH`: [https://github.com/adaptlearning/adapt_authoring/wiki/Installing-FFmpeg](https://github.com/adaptlearning/adapt_authoring/wiki/Installing-FFmpeg).


### Install mkvtoolnix

For Ubuntu or Linux Mint:

`sudo apt-get install mkvtoolnix`


For Windows:

Download and install: [https://mkvtoolnix.download/downloads.html#windows](https://mkvtoolnix.download/downloads.html#windows)


## Getting Started

With a terminal open, follow these steps.

First, clone this repository on your computer using git or by downloading this project and extracting it.

Next, `cd` into the directory that contains this project.  For example:

`cd ~/Downloads/normalizeMedia // Linux`
`cd C:\Users\[your user name]\Downloads\normalizeMedia // Windows`

Next, you will need to install the npm dependencies:

`npm i`

If `ffmpeg` is not currently on your `PATH`, you will either need to put it on your `PATH`, or you will need to pass the path to the `ffmpeg` executable when you run one of the conversion scripts.

You can check to see if `ffmpeg` is already on your path by typing `ffmpeg` into a terminal.  If you see the ffmpeg help information, ffmpeg has been found.  If not, you must supply it to the script.

Examples (you will likely need to change these to suit your needs):

`npm run dashcam --ffmpeg /home/user/Downloads/ffmpeg/build/ffmpeg [other arguments, detailed below] // Linux`
`npm run dashcam --ffmpeg C:\Users\[your user name]\Downloads\ffmpeg\bin\ffmpeg.exe [other arguments, detailed below] // Windows`

See the `Use` section below for instructions on using the available conversion scripts.


# Use

Note that you can run any of the below `npm` script commands with no arguments to get help for that command.


### Convert Dashcam Videos

`@todo`


### Convert Audible Audiobooks

`@todo`


## TODO

1. create utils as a separate package, or maybe each individual utils category as its own package
1. eslint
1. tests
1. ~ require module
