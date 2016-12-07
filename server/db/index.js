var MongoClient = require('mongodb').MongoClient;
var Promise = require('bluebird');

module.exports = new Promise(function(resolve, reject) {
  MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost/humanitybox', function(err, conn) {
    if (err) throw err;
    resolve(conn);
  });
});
