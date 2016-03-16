# jQuery-YQL-Feeds
jQuery plugin for displaying of RSS feeds via YahooApis based on plugin jquery.zrssfeed by Zazar from www.zazar.net

It was built when Google Feeds API stopped being supported, to use YQL instead.

# Sample usage

$( document ).ready( function() {
  var feedsUrl = 'your-feeds-url-here';
  $( '#feeds-container' ).rssfeed( feedsUrl, {
    limit: 3,
    header: false,
    media: false,
    snippet: false,
    date: false,
    content: false,
    titletag: 'h5'
  });
});
