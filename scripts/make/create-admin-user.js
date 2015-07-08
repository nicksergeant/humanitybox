'use strict';

var bcrypt = require('bcrypt-nodejs');
var Q = require('q');
var r = require('rethinkdb');

var getInput = function(label) {
  var deferred = Q.defer();
  var stdin = process.stdin;
  stdin.resume();
  stdin.setEncoding('utf8');
  process.stdout.write(label + ': ');
  stdin.on('data', function( key ){
    if (key === '\u0003') {
      process.exit();
    }
    deferred.resolve(key);
  });
  return deferred.promise;
};

var customer, username, password;
console.log('\n# Create admin user:\n');
getInput('Username')
  .then(function(usernameInput) {
    username = usernameInput.replace(/![@\w]/g, '').trim();
  })
  .then(function() {
    return getInput('Password').then(function(passwordInput) {
      password = passwordInput.replace(/![@\w]/g, '').trim();
    });
  })
  .then(function() {
    r.connect({
      host: '172.17.42.1',
      db: 'humanitybox',
      port: 28015
    }).then(function(conn) {
      bcrypt.hash(password, null, null, function(err, hash) {
        var admin = {
          isAdmin: true,
          username: username,
          password: hash,
          created: new Date().toISOString()
        };
        r.table('users').insert(admin).run(conn).then(function() {
          console.log('Done.');
          process.exit();
        }).error(function(err) {
          console.log(err);
          process.exit();
        });
      });
    }).error(function(err) {
      console.log(err);
      process.exit();
    });
  });
