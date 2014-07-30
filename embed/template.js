(function(document) {'use strict';
  var campaigns = <%- campaigns %>;
  var randomIndex = Math.floor((Math.random() * campaigns.length) + 0);
  var campaign = campaigns[randomIndex];
  var html = "<style><%- css %></style>";
  html += '<div class="humanitybox">';
  html += '  <h6>' + campaign.title + '</h6>';
  html += '  <img src="' + campaign.image_url + '" />';
  html += '  <p>' + campaign.blurb + '</p>';
  html += '</div>';
  document.write(html);
}(document));
