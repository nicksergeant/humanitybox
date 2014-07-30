(function(document) {'use strict';
  var campaigns = <%- campaigns %>;
  var randomIndex = Math.floor((Math.random() * campaigns.length) + 0);
  var campaign = campaigns[randomIndex];
  var html = "<style><%- css %></style>";
  html += '<a class="humanitybox" href="' + campaign.url + '">';
  html += '  <span class="humanitybox-title">' + campaign.title + '</span>';
  html += '  <img src="' + campaign.image_url + '" />';
  html += '  <span class="humanitybox-blurb">' + campaign.blurb + '</span>';
  html += '</a>';
  html += '<a class="humanitybox-link" href="http://humanitybox.com/">';
  html += '  <img src="http://humanitybox.com/favicon.ico" /> Humanity Box'
  html += '</a>';
  document.write(html);
}(document));
