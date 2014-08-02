'use strict';

// Modules.
var ejs = require('ejs');
var express = require('express');

// Application config.
var app = express();
app.set('view engine', 'ejs');
app.set('views', 'public/src');

// Static resources.
app.use(express.favicon('public/src/img/favicon.ico'));
app.use('/public', express.compress());
app.use('/public', express.static('public'));
app.use('/public', function(req, res, next) { res.send(404); });

// Server middleware.
app.use(express.cookieParser(process.env.COOKIE_SECRET || 'this is a secret'));
app.use(express.cookieSession());
app.use(express.logger(process.env.NODE_ENV === 'production' ? '' : 'dev'));
app.use(express.json());
app.use(express.urlencoded());

// Error handling.
app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

app.get('/', function(req, res) {
  res.render('base');
});

// Server.
app.listen(process.env.PORT || 3000, '0.0.0.0');
