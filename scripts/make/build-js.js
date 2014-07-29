'use strict';

var fs = require('fs');
var futures = require('futures');
var request = require('request');

process.on('uncaughtException', function (error) {
  console.log(error.stack);
});

var existingCampaigns = fs.readFileSync(__dirname + '/../../campaigns-shown.csv', { flag: 'a+' })
  .toString()
  .trim()
  .split(',');
var newCampaigns = [];

var getCampaigns = function(page, next) {
  request('http://www.giveforward.com/manage/stats_fundraisers/active?apiKey=' + process.env.GF_KEY + '&page=' + page, function(err, response, body) {
    var campaigns = JSON.parse(body).data[0].fundraisers;

    console.log('- On page ' + page + '.');

    Object.keys(campaigns).forEach(function(ck) {
      var campaign = campaigns[ck];

      if (existingCampaigns.indexOf(campaign.uuid) === -1 &&
          campaign.status === 'active' &&
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
  getCampaigns(1, next);
});

sequence.then(function(next) {
  // Build JS for these campaigns.
});

sequence.then(function(next) {
  fs.writeFileSync(__dirname + '/../../campaigns-shown.csv', existingCampaigns.join(','));
});

sequence.then(function(next) {
  console.log('Done.');
  process.exit();
});
