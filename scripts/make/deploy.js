'use strict';

var cloudfront = require('cloudfront');
var fs = require('fs');
var knox = require('knox');
var uuid = require('node-uuid');

var s3 = knox.createClient({
  key: process.env.AWS_KEY,
  secret: process.env.AWS_SECRET,
  bucket: process.env.S3_BUCKET
});

var cf = cloudfront.createClient(process.env.AWS_KEY, process.env.AWS_SECRET);

var headers = {
  'Content-Type': 'application/json',
  'x-amz-acl': 'public-read'
};

s3.putFile(__dirname + '/../../tmp/humanitybox.js', '/humanitybox.js', headers, function(err, res) {
  if (err) throw err;
  console.log('File uploaded to S3.');
  cf.createInvalidation(process.env.CF_DISTRIBUTION, uuid.v4(), '/humanitybox.js', function(err, invalidation) {
    if (err) throw err;
    console.log('Old JS invalidated.');
    process.exit();
  });
});
