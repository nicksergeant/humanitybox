'use strict';

var config = require('../../server/config');
var knox = require('knox');

var s3 = knox.createClient({
  key: config.aws.key,
  secret: config.aws.secret,
  bucket: config.s3.bucket
});

process.on('uncaughtException', function (error) {
  console.log(error.stack);
});

var buffer = new Buffer('');
var headers = {
  'Content-Type': 'text/plain'
};
s3.putBuffer(buffer, '/campaigns-shown.csv', headers, function(err, res) {
  console.log('- campaigns-shown.csv reset and uploaded to S3.');
  process.exit();
});
