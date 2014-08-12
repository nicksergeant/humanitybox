'use strict';

var config = require('../../server/config');
var db = require('../../server/db');
var fs = require('fs');
var futures = require('futures');
var knox = require('knox');
var r = require('rethinkdb');
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

var index = 1;
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
      .on('end', function () {
        s3Logs.del(key).on('response', function(res){
          deferred.resolve();
        }).end(); 
      });
  });
  return deferred.promise;
}
function processLogFile(logFile, key) {
  var logLines = logFile.toString().split('\n');
  logLines.shift(); logLines.shift(); logLines.pop();
  console.log('- (' + index + ' of ' + logFiles.length + ') ' + key + ' - ' + logLines.length + ' records.');
  index++;
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
  logFiles.forEach(function(logFile) {
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
  var logLinesSequence = futures.sequence();
  logs.forEach(function(log) {
    var url = log.split('\t')[9];
    var domainParts = url.match('^(?:(?:f|ht)tps?://)?([^/:]+)');
    if (domainParts.length > 1 && url !== '-' && url !== '0.0.0.0' && url !== 'localhost') {
      url = domainParts[1];
      logLinesSequence.then(function(logLinesSequenceNext) {
        r.table('stats').filter({ url: url })
          .run(db.conn).then(function(stats) {
            stats.toArray(function(err, stats) {
              if (err) return db.handleError(err);
              if (stats.length) {
                var existingStat = stats[0];
                r.table('stats').get(existingStat.id).update({ count: existingStat.count + 1 }, { returnVals: true })
                  .run(db.conn).then(function(stat) {
                    console.log('- ' + url + ' - Count: ' + stat.new_val.count);
                    logLinesSequenceNext();
                  }).error(function(err) { db.handleError(err); });
              } else {
                r.table('stats').insert({ url: url, count: 1 }, { returnVals: true })
                  .run(db.conn).then(function(stat) {
                    console.log('- ' + url + ' - Count: 1');
                    logLinesSequenceNext();
                  }).error(function(err) { db.handleError(err); });
              }
            });
          }).error(function(err) { db.handleError(err); });
      });
    }
  });
  logLinesSequence.then(function(logLinesSequenceNext) {
    next();
  });
});

sequence.then(function(next) {
  console.log('Done.');
  process.exit();
});
