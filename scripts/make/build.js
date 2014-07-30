'use strict';

var fs = require('fs');
var futures = require('futures');
var request = require('request');
var ejs = require('ejs');

process.on('uncaughtException', function (error) {
  console.log(error.stack);
});

var existingCampaigns = fs.readFileSync(__dirname + '/../../campaigns-shown.csv', { flag: 'a+' })
  .toString()
  .trim()
  .split(',');
var newCampaigns = [];
var processedCampaigns = [];

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
  fs.writeFileSync(__dirname + '/../../../tmp/humanitybox.js', js, { flag: 'w+' });
  next();
});

sequence.then(function(next) {
  fs.writeFileSync(__dirname + '/../../../tmp/campaigns-shown.csv', existingCampaigns.join(','));
});

sequence.then(function(next) {
  console.log('Done.');
  process.exit();
});
