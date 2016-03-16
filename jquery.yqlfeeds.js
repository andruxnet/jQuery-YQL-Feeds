/**
 * Plugin: jquery.yqlfeeds
 * 
 * Version: 1.0
 * (c) Copyright 2015 andruxnet
 * 
 * Description: jQuery plugin for displaying of RSS feeds via YahooApis
 *              Based on plugin jquery.zrssfeed by Zazar from www.zazar.net
 * 
 **/

(function($){

	$.fn.rssfeed = function(url, options, fn) {	
	
		// Set plugin defaults
		var defaults = {
			limit: 10,
			header: true,
			titletag: 'h4',
			date: true,
			content: true,
			snippet: true,
			media: true,
			showerror: true,
			errormsg: '',
			key: null,
			ssl: false,
			linktarget: '_self'
		};  
		var options = $.extend(defaults, options); 
		
		// Functions
		return this.each(function(i, e) {
			var $e = $(e);
			var s = '';

			// Check for SSL protocol
			if (options.ssl) s = 's';
			
			// Add feed class to user div
			if (!$e.hasClass('rssFeed')) $e.addClass('rssFeed');
			
			// Check for valid url
			if(url == null) return false;
			
			// Create YahooApis URL
			var api = "http" + s + "://query.yahooapis.com/v1/public/yql?q=";
			var q = "select * from rss where url = '" + url + "'";

			if ( options.limit != null )
				q += " limit " + options.limit;

			api += encodeURIComponent( q );

			if (options.key != null) api += "&key=" + options.key;

			api += '&format=json';

			// Send request
			$.get(api, function(data){
				// Check for error
				if (data.query.count > 0) {
	
					// Process the feeds
					_process(e, data, options);

					// Optional user callback function
					if ($.isFunction(fn)) fn.call(this,$e);
					
				} else {

					// Handle error if required
					if (options.showerror)
						if (options.errormsg != '') {
							var msg = options.errormsg;
						} else {
							var msg = data.responseDetails;
						};
						$(e).html('<div class="rssError"><p>'+ msg +'</p></div>');
				};
			});				
		});
	};
	
	// Function to create HTML result
	var _process = function(e, data, options) {
		// Get JSON feed data
		var feeds = data.query.results.item;

		if (!feeds) {
			return false;
		}

		var html = '';	
		var row = 'odd';
		
		// Get XML data for media (parseXML not used as requires 1.5+)
		if (options.media) {
			var xml = getXMLDocument(data.xmlString);
			var xmlEntries = xml.getElementsByTagName('item');
		}
		
		// Add header if required
		if (options.header)
			html +=	'<div class="rssHeader">' +
				'<a href="'+feeds.link+'" title="'+ feeds.description +'">'+ feeds.title +'</a>' +
				'</div>';
			
		// Add body
		html += '<div class="rssBody">' +
			'<ul>';

		// make sure we're working with an array
		if ( ! feeds.length ) {
			feeds = $.makeArray( feeds );
		}

		// Add feeds
		for (var i=0; i<feeds.length; i++) {
			
			// Get individual feed
			var entry = feeds[i];
			var pubDate;

			// Format published date
			if (entry.pubDate) {
				var entryDate = new Date(entry.pubDate);
				var pubDate = entryDate.toLocaleDateString();
			}

			// Add feed row
			html += '<li class="rssRow '+row+'">' + 
				'<'+ options.titletag +'><a href="'+ entry.link +'" title="View this feed at '+ feeds.title +'" target="'+ options.linktarget +'">'+ entry.title +'</a></'+ options.titletag +'>'
			if (options.date && pubDate) html += '<div>'+ pubDate +'</div>'
			if (options.content) {
			
				// Use feed snippet if available and optioned
				if (options.snippet && entry.encoded != '') {
					var content = $( entry.encoded ).text().substr( 0, 120 ) + ' ...';
				} else {
					var content = entry.encoded;
				}
				
				html += '<p>'+ content +'</p>'
			}
			
			// Add any media
			if (options.media && xmlEntries.length > 0) {
				var xmlMedia = xmlEntries[i].getElementsByTagName('enclosure');
				if (xmlMedia.length > 0) {
					html += '<div class="rssMedia"><div>Media files</div><ul>'
					for (var m=0; m<xmlMedia.length; m++) {
						var xmlUrl = xmlMedia[m].getAttribute("url");
						var xmlType = xmlMedia[m].getAttribute("type");
						var xmlSize = xmlMedia[m].getAttribute("length");
						html += '<li><a href="'+ xmlUrl +'" title="Download this media">'+ xmlUrl.split('/').pop() +'</a> ('+ xmlType +', '+ formatFilesize(xmlSize) +')</li>';
					}
					html += '</ul></div>'
				}
				html += '</li>';
			}
			
			// Alternate row classes
			if (row == 'odd') {
				row = 'even';
			} else {
				row = 'odd';
			}			
		}
		
		html += '</ul>' +
			'</div>'
		
		$(e).html(html);
	};
	
	function formatFilesize(bytes) {
		var s = ['bytes', 'kb', 'MB', 'GB', 'TB', 'PB'];
		var e = Math.floor(Math.log(bytes)/Math.log(1024));
		return (bytes/Math.pow(1024, Math.floor(e))).toFixed(2)+" "+s[e];
	}

	function getXMLDocument(string) {
		var browser = navigator.appName;
		var xml;
		if (browser == 'Microsoft Internet Explorer') {
			xml = new ActiveXObject('Microsoft.XMLDOM');
			xml.async = 'false'
			xml.loadXML(string);
		} else {
			xml = (new DOMParser()).parseFromString(string, 'text/xml');
		}
		return xml;
	}

})(jQuery);
