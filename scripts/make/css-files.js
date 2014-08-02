'use strict';

var fs = require('fs');
var resources = JSON.parse(fs.readFileSync(__dirname + '/../../resources.json'));

var files = resources.vendorcss.concat(resources.css);
files.forEach(function(file) {
  console.log(file);
});
