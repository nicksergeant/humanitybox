'use strict';

var knox = require('knox');

var s3 = knox.createClient({
  key: process.env.AWS_KEY,
  secret: process.env.AWS_SECRET,
  bucket: process.env.S3_BUCKET
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
