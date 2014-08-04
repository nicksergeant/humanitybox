'use strict';

var config = require('../../server/config');
var fs = require('fs');
var futures = require('futures');
var knox = require('knox');
var s3lister = require('s3-lister');
var q = require('q');
var zlib = require('zlib');

var s3Logs = knox.createClient({
  key: config.aws.key,
  secret: config.aws.secret,
  bucket: config.s3.logsBucket
});
var s3 = knox.createClient({
  key: config.aws.key,
  secret: config.aws.secret,
  bucket: config.s3.bucket
});

process.on('uncaughtException', function (error) {
  console.log(error.stack);
});

var logFiles = [];
var logs = [];

function downloadLogFile(key) {
  var deferred = q.defer();
  s3Logs.getFile('/' + key, function (err, res) {
    if (err) throw err;
    res = res.pipe(zlib.createGunzip());
    res
      .on('data', function (data) { processLogFile(data, key); })
      .on('error', function (err) { throw err; })
      .on('end', function () { deferred.resolve(); });
  });
  return deferred.promise;
}
function processLogFile(logFile, key) {
  var logLines = logFile.toString().split('\n');
  logLines.shift(); logLines.shift(); logLines.pop();
  console.log('  - ' + key + ' - ' + logLines.length + ' records.');
  logLines.forEach(function(line) { logs.push(line); });
}

var sequence = futures.sequence();

sequence.then(function(next) {
  console.log('- Getting all log files...');
  new s3lister(s3Logs)
    .on('data', function(data) { logFiles.push(data); })
    .on('error', function (err) { throw err; })
    .on('end', function() { next(); });
});

sequence.then(function(next) {
  var filesSequence = futures.sequence();

  // TODO: Remove.
  var i = 1;
  var tmpLogFiles = [];
  logFiles.some(function(logFile) {
    tmpLogFiles.push(logFile);
    if (i > 100) return true;
    i++;
  });

  tmpLogFiles.forEach(function(logFile) {
    filesSequence.then(function(filesSequenceNext) {
      downloadLogFile(logFile.Key).then(function() {
        filesSequenceNext();
      });
    });
  });
  filesSequence.then(function(filesSequenceNext) {
    next();
  });
});

sequence.then(function(next) {
  logs.forEach(function(log) {
    log = log.split('\t');
    console.log(log[9]);
  });
});

sequence.then(function(next) {
  console.log('Done.');
  process.exit();
});
