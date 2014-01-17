var gulp = require('gulp');
var request = require('request');
var know = require('knox');

var config = require('./config');

gulp.task('s3', function() {
  var client = know.createClient(config.s3);
  var url = 'http://httpbin.org/get';

  request(url, function(error, response, body) {

    var buf = new Buffer(body);
    var headers = {
      'Content-Type': 'application/json',
      'x-amz-acl': 'public-read'
    };

    client.putBuffer(buf, '/data.json', headers, function(err, res) {
      if (err) {
        throw err;
      }

      console.log('File uploaded to s3');
    });

  });

});
