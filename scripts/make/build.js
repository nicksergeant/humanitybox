'use strict';

var cloudfront = require('cloudfront');
var config = require('../../server/config');
var ejs = require('ejs');
var fs = require('fs');
var futures = require('futures');
var knox = require('knox');
var request = require('request');
var uuid = require('node-uuid');

var cf = cloudfront.createClient(config.aws.key, config.aws.secret);
var s3 = knox.createClient({
  key: config.aws.key,
  secret: config.aws.secret,
  bucket: config.s3.bucket
});

process.on('uncaughtException', function (error) {
  console.log(error.stack);
});

var existingCampaigns = [];
var newCampaigns = [];
var processedCampaigns = [];

var getCampaigns = function(page, next) {
  request('http://www.giveforward.com/manage/stats_fundraisers/active?apiKey=' + config.gfKey + '&page=' + page, function(err, response, body) {
    var campaigns = JSON.parse(body).data[0].fundraisers;

    console.log('- On page ' + page + '.');

    Object.keys(campaigns).forEach(function(ck) {
      var campaign = campaigns[ck];

      if (existingCampaigns.indexOf(campaign.uuid) === -1 &&
          campaign.status === 'active' &&
          campaign.donation_count !== '0' &&
          newCampaigns.length < 10) {
        newCampaigns.push(campaign);
        existingCampaigns.push(campaign.uuid);
        console.log('  - Added campaign ' + campaign.uuid + '.');
      }
    });

    if (newCampaigns.length >= 10) {
      next();
    } else {
      getCampaigns(page + 1, next);
    }
  });
};

var sequence = futures.sequence();

sequence.then(function(next) {
  s3.get('/campaigns-shown.csv').on('response', function(res) {
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      existingCampaigns = chunk.trim().split(',');
    });
    res.on('end', function() {
      next();
    });
  }).end();
});

sequence.then(function(next) {
  getCampaigns(1, next);
});

sequence.then(function(next) {
  newCampaigns.forEach(function(campaign) {
    processedCampaigns.push({
      uuid: campaign.uuid,
      url: campaign.url,
      title: campaign.title,
      blurb: campaign.blurb,
      goal: campaign.goal,
      image_url: campaign.image_url.replace('c_fill,g_face,h_HEIGHT,w_WIDTH', '')
    });
  });
  next();
});

sequence.then(function(next) {
  var css = fs.readFileSync(__dirname + '/../../embed/template.css', { flag: 'a+' })
    .toString()
    .replace(/\n/g, ' ')
    .replace(/  /g, '')
    .trim();
  var template = __dirname + '/../../embed/template.js';
  var js = ejs.render(fs.readFileSync(template, 'utf-8'), {
    campaigns: JSON.stringify(processedCampaigns),
    css: css
  });

  return next(js);
});

sequence.then(function(next, js) {
  var buffer = new Buffer(js);
  var headers = {
    'Content-Type': 'application/json',
    'x-amz-acl': 'public-read'
  };
  s3.putBuffer(buffer, '/humanitybox.js', headers, function(err, res) {
    console.log('- humanitybox.js uploaded to S3.');
    next();
  });
});

sequence.then(function(next) {
  var buffer = new Buffer(existingCampaigns.join(','));
  var headers = {
    'Content-Type': 'text/plain'
  };
  s3.putBuffer(buffer, '/campaigns-shown.csv', headers, function(err, res) {
    console.log('- campaigns-shown.csv uploaded to S3.');
    next();
  });
});

sequence.then(function(next) {
  cf.createInvalidation(config.cfDistribution, uuid.v4(), '/humanitybox.js', function(err, invalidation) {
    if (err) throw err;
    console.log('- Old humanitybox.js invalidated.');
    process.exit();
  });
});
