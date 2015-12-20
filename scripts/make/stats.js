'use strict';

var db = require('../../server/db');
var fs = require('fs');
var futures = require('futures');
var knox = require('knox');
var r = require('rethinkdb');
var s3lister = require('s3-lister');
var q = require('q');
var zlib = require('zlib');

var s3Logs = knox.createClient({
  key: process.env.AWS_KEY,
  secret: process.env.AWS_SECRET,
  bucket: process.env.LOGS_BUCKET
});
var s3 = knox.createClient({
  key: process.env.AWS_KEY,
  secret: process.env.AWS_SECRET,
  bucket: process.env.S3_BUCKET
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
  logLines.forEach(function(line) {
    var fields = line.split('\t');
    var url = fields[9];
    var domainParts = url.match('^(?:(?:f|ht)tps?://)?([^/:]+)');
    var log = { domain: domainParts.length > 1 ? domainParts[1] : null, fields: fields };
    logs.push(log);
  });
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
    if (log.domain !== '-' &&
        log.domain !== '0.0.0.0' &&
        log.domain !== 'localhost' &&
        log.domain !== 'local.humanitybox.com' &&
        (log.domain.indexOf('snipt.net') === -1 || log.domain === 'snipt.net')) {
      logLinesSequence.then(function(logLinesSequenceNext) {
        r.table('stats').filter({ url: log.domain })
          .run(db.conn).then(function(stats) {
            stats.toArray(function(err, stats) {
              if (err) return db.handleError(err);
              if (stats.length) {
                var existingStat = stats[0];
                r.table('stats').get(existingStat.id).update({ count: existingStat.count + 1 }, { returnChanges: true })
                  .run(db.conn).then(function(stat) {
                    console.log('- ' + log.domain + ' - Count: ' + stat.changes[0].new_val.count);
                    logLinesSequenceNext();
                  }).error(function(err) { db.handleError(err); });
              } else {
                r.table('stats').insert({ url: log.domain, count: 1 }, { returnChanges: true })
                  .run(db.conn).then(function(stat) {
                    console.log('- ' + log.domain + ' - Count: 1');
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
