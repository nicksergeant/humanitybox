(function(document) {'use strict';
  var campaigns = <%- campaigns %>;
  var randomIndex = Math.floor((Math.random() * campaigns.length) + 0);
  var campaign = campaigns[randomIndex];
  var html = "<style><%- css %></style>";
  html += '<a class="humanitybox" href="' + campaign.url + '" target="_blank">';
  html += '  <span class="humanitybox-title">' + campaign.title + '</span>';
  html += '  <span class="humanitybox-img-container"><img src="' + campaign.image_url + '" /></span>';
  html += '  <span class="humanitybox-blurb">' + campaign.blurb + '</span>';
  html += '</a>';
  html += '<a class="humanitybox-link" href="http://humanitybox.com/" target="_blank">';
  html += '  <img src="http://humanitybox.com/favicon.ico" /> <span>Humanity Box</span>';
  html += '</a>';
  var div = document.getElementById('humanitybox');
  if (div) {
    div.innerHTML = html;
  } else {
    document.write(html);
  }
}(document));
