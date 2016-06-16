'use strict';

var db = require('../db');

exports.list = function() {
  return function(req, res, next) {
    db.then(function(dbConn) {
      dbConn.collection('statistics')
        .find({})
        .sort({ 'count': -1 })
        .limit(20)
        .toArray(function(err, items) {
          if (err) throw new Error(err);
          items.forEach(function(item) {
            item.id = item._id.toString();
          });
          res.send(items);
        });
      });
  };
};
