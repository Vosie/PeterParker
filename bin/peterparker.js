#!/usr/bin/env node

if (process.argv.length < 4) {
  console.log('syntax: peterparker {url} {config json} [output path] [update]');
  process.exit(-1);
  return;
}

var path = require('path');

var config;
if (process.argv[3][0] === path.sep ||
    process.argv[3].substr(1, 2) === (':' + path.sep)) {
  config = require(process.argv[3]);
} else {
  config = require(process.cwd() + path.sep + process.argv[3]);
}

if (!config) {
  console.log('please give us a valid config file');
  process.exit(-2);
  return;
}

var updateMode = process.argv.length > 5 && process.argv[5] === 'update';

var fs = require('fs');
var pp = require('../libs/peter-parker.js');

var peter = new pp.PeterParker();
var parsed = null;

function updateFile(json, file) {
  fs.readFile(file, {encoding: 'utf-8'}, function(err, data) {
    if (err) {
      console.log('file read error');
      fs.writeFile(file, JSON.stringify(json));
    } else {
      var origData = JSON.parse(data);
      for (var key in json) {
        origData[key] = json[key];
      }
      fs.writeFile(file, JSON.stringify(origData));
    }
  });
}

peter.on('ready', function() {
  parsed = peter.parse('', config);
});

peter.on('error', function(e) {
  console.error('error: ', e);
  process.exit(-3);
});

peter.on('done', function() {
  if (updateMode) {
    updateFile(parsed, process.argv[4]);
  } else if (process.argv[4]) {
    fs.writeFile(process.argv[4], JSON.stringify(parsed));
  } else {
    console.log(JSON.stringify(parsed));
  }
  peter.free();
});

peter.init(process.argv[2]);
