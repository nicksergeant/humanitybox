'use strict';

var bcrypt = require('bcrypt-nodejs');
var db = require('../db');
var r = require('rethinkdb');

exports.local = function() {

  var LocalStrategy = require('passport-local').Strategy;

  return {
    deserialize: function(id, done) {
      r.table('users').get(id)
        .run(db.conn).then(function(user) {
          done(null, user);
        }).error(function(err) { db.handleError(err); });
    },
    serialize: function(user, done) {
      done(null, user.id);
    },
    strategy: new LocalStrategy(function(username, password, done) {
      r.table('users').filter({ username: username })
        .run(db.conn).then(function(users) {
          users.toArray(function(err, users) {
            if (err) return db.handleError(err);
            if (!users.length) {
              done(null, false, { message: 'Incorrect username or password.' });
            }
            var user = users[0];
            bcrypt.compare(password, user.password, function(err, correct) {
              if (!correct) {
                return done(null, false, { message: 'Incorrect username or password.' });
              } else {
                return done(null, user);
              }
            });
          });
        }).error(function(err) { db.handleError(err); });
    })
  };
};
