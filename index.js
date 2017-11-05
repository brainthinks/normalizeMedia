#!/usr/bin/env node
'use strict';

const FileHound = require('filehound');

const dir = process.argv[1];

console.log(dir);
process.exit();

const files = FileHound.create()
  .paths('/some/dir')
  .ext('json')
  .find();

files.then(console.log);