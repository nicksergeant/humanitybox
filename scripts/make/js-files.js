'use strict';

var fs = require('fs');
var resources = JSON.parse(fs.readFileSync(__dirname + '/../../resources.json'));

var files = resources.vendorjs.concat(resources.js);
files.forEach(function(file) {
  console.log(file);
  console.log('scripts/make/js-semicolon.js');
});
