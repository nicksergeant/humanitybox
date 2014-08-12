'use strict';

var db = require('../db');
var r = require('rethinkdb');

exports.list = function() {
  return function(req, res, next) {
    r.table('stats').orderBy(r.desc('count')).limit(20)
      .run(db.conn).then(function(stats) {
        stats.toArray(function(err, stats) {
          if (err) return db.handleError(err, res);
          res.send(stats);
        });
      }).error(function(err) { db.handleError(err, res); });
  };
};
