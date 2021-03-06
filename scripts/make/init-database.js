'use strict';

var r = require('rethinkdb');

var db = r.connect({
  host: '45.79.167.199',
  port: 28015
}).then(function(conn) {
  r.dbCreate('humanitybox').run(conn).then(function() {
    return r.db('humanitybox').tableCreate('users').run(conn);
  }).then(function() {
    return r.db('humanitybox').tableCreate('stats').run(conn);
  }).then(function() {
    console.log('Done.');
    process.exit();
  }).error(function(err) {
    console.log(err);
    process.exit();
  });
}).error(function(err) {
  console.log(err);
  process.exit();
});
