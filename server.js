'use strict';

// Modules.
var auth = require('basic-auth');
var bodyParser = require('body-parser');
var compression = require('compression');
var config = require('./server/config');
var cookieParser = require('cookie-parser');
var db = require('./server/db');
var ejs = require('ejs');
var errorhandler = require('errorhandler');
var express = require('express');
var flash = require('connect-flash');
var fs = require('fs');
var morgan  = require('morgan');
var passport = require('passport');
var protectJSON = require('./server/lib/protectJSON');
var r = require('rethinkdb');
var raven = require('raven');
var resources = JSON.parse(fs.readFileSync(__dirname + '/resources.json'));
var session = require('express-session');
var stats = require('./server/stats');
var users = require('./server/users');

// Express application.
var app = express();

// Application config.
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);
app.set('views', 'public/src');
app.use(compression());
app.set('json spaces', 0);
app.use(flash());

// Server middleware.
app.use(cookieParser(config.cookieSecret));
app.use(session({ secret: config.cookieSecret }));
app.use(morgan(process.env.NODE_ENV === 'production' ? '' : 'dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

// Traceback on uncaught exceptions.
process.on('uncaughtException', function (error) {
  console.log(error.stack);
});

// Production provisions.
if (process.env.NODE_ENV === 'production') {
  app.use(errorhandler({ dumpExceptions: true, showStack: true }));
  app.use(protectJSON);
  app.use(raven.middleware.express(config.sentryUrl));
}

// Authentication.
passport.deserializeUser(users.auth.local().deserialize);
passport.serializeUser(users.auth.local().serialize);
passport.use(users.auth.local().strategy);
app.use(passport.initialize());
app.use(passport.session());
app.get('/logout/', users.routes.logoutLocal);
app.post('/login/', users.routes.loginLocal(passport));

// Users API.
app.post('/api/users', users.routes.create());
app.get('/api/users', users.routes.list());
app.get('/api/users/:id', users.routes.get());
app.put('/api/users/:id', users.routes.update());
app.delete('/api/users/:id', users.routes.delete());

// Stats API.
app.get('/api/stats', stats.routes.list());

// Application route.
app.get('/*', function(req, res) {
  var locals = {
    env: process.env.NODE_ENV || 'development',
    message: req.flash('error'),
    resources: resources,
    user: req.user
  };
  if (process.env.NODE_ENV === 'production') {
    locals.cssModifiedTime = fs.statSync(__dirname + '/public/humanitybox.css').mtime.getTime() / 1000;
    locals.jsModifiedTime = fs.statSync(__dirname + '/public/humanitybox.js').mtime.getTime() / 1000;
  }
  res.render('base', locals);
});

// Server.
db.then(function() {
  app.listen(process.env.PORT || 3000, '0.0.0.0');
});
