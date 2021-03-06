'use strict';

var bcrypt = require('bcrypt-nodejs');
var db = require('../db');
var r = require('rethinkdb');

var configureUser = function(user) {
  return user;
};
var configureUsers = function(users) {
  users.forEach(configureUser);
  return users;
};

exports.create = function() {
  return function(req, res, next) {
    if (!req.user || !req.user.isAdmin) return res.send(403);
    req.body.created = new Date().toISOString();
    bcrypt.hash(req.body.password, null, null, function(err, hash) {
      req.body.password = hash;
      r.table('users').insert(req.body, { returnChanges: true })
        .run(db.conn).then(function(result) {
          if (result.inserted === 1) {
            delete result.changes[0].new_val.password;
            res.send(result.changes[0].new_val);
          } else {
            res.send(500);
          }
        }).error(function(err) { db.handleError(err, res); });
    });
  };
};
exports.get = function() {
  return function(req, res, next) {
    if (!req.user) return res.send(403);
    if (!req.user.isAdmin && req.params.id !== req.user.id) return res.send(500);
    r.table('users').get(req.params.id).without('password')
      .run(db.conn).then(function(user) {
        user ? res.json(configureUser(user)) : res.send(404);
      }).error(function(err) { db.handleError(err, res); });
  };
};
exports.delete = function() {
  return function(req, res, next) {
    if (!req.user || !req.user.isAdmin) return res.send(403);
    r.table('users').get(req.params.id).delete()
      .run(db.conn).then(function(result) {
        result.deleted === 1 ? res.send(204) : res.send(404);
      }).error(function(err) { db.handleError(err, res); });
  };
};
exports.list = function() {
  return function(req, res, next) {
    if (!req.user || !req.user.isAdmin) return res.send(403);
    r.table('users').without('password')
      .run(db.conn).then(function(users) {
        users.toArray(function(err, users) {
          if (err) return db.handleError(err, res);
          res.send(configureUsers(users));
        });
      }).error(function(err) { db.handleError(err, res); });
  };
};
exports.loginLocal = function(passport) {
  return function(req, res, next) {
    passport.authenticate('local', { failureFlash: true }, function(err, user, info) {
      if (err) { return db.handleError(err, res); }
      if (!user) {
        req.flash('error', 'Incorrect username or password.');
        return res.redirect('/login/');
      }
      req.session.message = null;
      req.logIn(user, function(err) {
        if (err) return next(err);
        res.redirect('/admin/');
      });
    })(req, res, next);
  };
};
exports.logoutLocal = function(req, res) {
  req.logout();
  res.redirect('/');
};
exports.update = function() {
  return function(req, res, next) {
    if (!req.user || !req.user.isAdmin) return res.send(403);
    bcrypt.hash(req.body.password, null, null, function(err, hash) {
      req.body.password ? req.body.password = hash : delete req.body.password;
      r.table('users').get(req.params.id).update(req.body, { returnChanges: true })
        .run(db.conn).then(function(user) {
          delete user.changes[0].new_val.password;
          res.json(user.changes[0].new_val);
        }).error(function(err) { db.handleError(err, res); });
    });
  };
};
