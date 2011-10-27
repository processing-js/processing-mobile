/*
 * Based on jQuery LiveTwitter 1.7.2 https://github.com/elektronaut/jquery.livetwitter
 * - Live updating Twitter plugin for jQuery
 *
 * Copyright (c) 2009-2011 Inge Jørgensen (elektronaut.no)
 * Licensed under the MIT license (MIT-LICENSE.txt)
 *
 * Modified by David Humphrey (@humphd) for use with Processing.js
 */

(function (document, Processing) {

  function getScript(success) {
    var script = document.createElement('script');
    script.src = "http://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.min.js";
    var head=document.getElementsByTagName('head')[0],
        done=false;
    script.onload = script.onreadystatechange = function(){
      if ( !done && (!this.readyState
           || this.readyState == 'loaded'
           || this.readyState == 'complete') ) {
        done=true;
        success(jQuery);
        script.onload = script.onreadystatechange = null;
      }
    };
    head.appendChild(script);
  }

  // Expose two new globals to Processing sketches:
  //   1) loadTweets() a function to start a live-feed query
  //   2) tweets an ArrayList of tweets that have been loaded
  var Pp = Processing.prototype;

  Pp.tweets = new Pp.ArrayList();

  Pp.loadTweets = function(query, geocode) {
    var options = {geocode: geocode};
    getScript(function(jQuery) {
      loadTweets$(jQuery, query, options);
    });
  };

  function loadTweets$(jQuery, query, options, callback) {
    // Extend jQuery with a reverse function if it isn't already defined
    if (!$.fn.reverse) {
      $.fn.reverse = function () {
        return this.pushStack(this.get().reverse(), arguments);
      };
    }

    $(this).each(function () {
      var settings = {};

      // Does this.twitter already exist? Let's just change the settings.
      if (this.twitter) {
        settings = $.extend(this.twitter.settings, options);
        this.twitter.settings = settings;
        if (query) {
          this.twitter.query = query;
        }
        if (this.twitter.interval) {
          this.twitter.refresh();
        }
        if (callback) {
          this.twitter.callback = callback;
        }
      // ..if not, let's initialize.
      } else {

        // These are the default settings.
        settings = $.extend({
          mode:      'search', // Mode, valid options are: 'search', 'user_timeline', 'list', 'home_timeline'
          rate:      3000,    // Refresh rate in ms
          limit:     100,       // Limit number of results
          imageSize: 24,       // Size of image in pixels
          refresh:   true,
          timeLinks: true,
          retweets:  false,
          service:   false,
          localization: {
            seconds: 'seconds ago',
            minute:  'a minute ago',
            minutes: 'minutes ago',
            hour:    'an hour ago',
            hours:   'hours ago',
            day:     'a day ago',
            days:    'days ago'
          },
        }, options);

        // showAuthor should default to true unless mode is 'user_timeline'.
        if (typeof settings.showAuthor === "undefined") {
          settings.showAuthor = (settings.mode === 'user_timeline') ? false : true;
        }

        // Set up a dummy function for the Twitter API callback.
        if (!window.twitter_callback) {
          window.twitter_callback = function () {
            return true;
          };
        }

        this.twitter = {
          settings:      settings,
          query:         query,
          interval:      false,
          container:     this,
          lastTimeStamp: 0,
          callback:      callback,

          // Convert the time stamp to a more human readable format
          relativeTime: function (timeString) {
            var parsedDate = Date.parse(timeString);
            var delta = (Date.parse(Date()) - parsedDate) / 1000;
            var r = '';
            if  (delta < 60) {
              r = delta + " " + settings.localization.seconds;
            } else if (delta < 120) {
              r = settings.localization.minute;
            } else if (delta < (45 * 60)) {
              r = (parseInt(delta / 60, 10)).toString() + " " + settings.localization.minutes;
            } else if (delta < (90 * 60)) {
              r = settings.localization.hour;
            } else if (delta < (24 * 60 * 60)) {
              r = '' + (parseInt(delta / 3600, 10)).toString() + " " + settings.localization.hours;
            } else if (delta < (48 * 60 * 60)) {
              r = settings.localization.day;
            } else {
              r = (parseInt(delta / 86400, 10)).toString() + " " + settings.localization.days;
            }
            return r;
          },

          // Update the relative timestamps
          updateTimestamps: function () {
            var twitter = this;
            $(twitter.container).find('span.time').each(function () {
              var time_element = twitter.settings.timeLinks ? $(this).find('a') : $(this);
              time_element.html(twitter.relativeTime(this.timeStamp));
            });
          },

          apiURL: function () {
            var params = {};

            var protocol = (window.location.protocol === 'https:') ? 'https:' : 'http:';
            var baseURL  = 'api.twitter.com/1/';
            var endpoint = '';

            // Override for Twitter-compatible APIs like Status.net
            if (this.settings.service) {
              baseURL = this.settings.service + '/api/';
            }

            // Search mode
            if (this.settings.mode === 'search') {
              baseURL  = (this.settings.service) ? this.settings.service + '/api/' : 'search.twitter.com/';
              endpoint = 'search';
              params   = {
                q:        (this.query && this.query !== '') ? this.query : null,
                geocode:  this.settings.geocode,
                lang:     this.settings.lang,
                rpp:      (this.settings.rpp) ? this.settings.rpp : this.settings.limit
              };

            // User/home timeline mode
            } else if (this.settings.mode === 'user_timeline' || this.settings.mode === 'home_timeline') {
              endpoint = 'statuses/' + this.settings.mode + '/' + encodeURIComponent(this.query);
              params = {
                count:       this.settings.limit,
                include_rts: (this.settings.mode === 'user_timeline' && this.settings.retweets) ? '1' : null
              };

            // Favorites mode
            } else if (this.settings.mode === 'favorites') {
              endpoint = 'favorites';
              params = {
                id:       encodeURIComponent(this.query)
              };

            // List mode
            } else if (this.settings.mode === 'list') {
              endpoint = encodeURIComponent(this.query.user) +
                         '/lists/' +
                         encodeURIComponent(this.query.list) +
                         '/statuses';
              params = {
                per_page: this.settings.limit
              };
            }

            // Construct the query string
            var queryString = [];
            for (var param in params) {
              if (params.hasOwnProperty(param) && typeof params[param] !== 'undefined' && params[param] !== null) {
                queryString[queryString.length] = param + '=' + encodeURIComponent(params[param]);
              }
            }
            queryString = queryString.join("&");

            // Return the full URL
            return protocol + '//' + baseURL + endpoint + '.json?' + queryString + '&callback=?';
          },

          // The different APIs will format the results slightly different,
          // so this method normalizes the tweet object.
          parseTweet: function (json) {
            var tweet = {
              id:         (json.id_str) ? json.id_str : json.id,
              text:       json.text,
              created_at: json.created_at
            };

            // Search/regular API differences
            if (this.settings.mode === 'search') {
              tweet = $.extend(tweet, {
                screen_name:       json.from_user,
                profile_image_url: json.profile_image_url
              });
            } else {
              tweet = $.extend(tweet, {
                screen_name:       json.user.screen_name,
                profile_image_url: json.user.profile_image_url,
                created_at:        json.created_at.replace(/^(\w+)\s(\w+)\s(\d+)(.*)(\s\d+)$/, "$1, $3 $2$5$4") // Fix for IE
              });
            }

            // Twitter/Status.net
            if (this.settings.service) {
              tweet = $.extend(tweet, {
                url:         'http://' + this.settings.service + '/notice/' + tweet.id,
                profile_url: 'http://' + this.settings.service + '/' + json.from_user
              });
              if (window.location.protocol === 'https:') {
                tweet.profile_image_url = tweet.profile_image_url.replace('http:', 'https:');
              }

            } else {
              tweet = $.extend(tweet, {
                url:         'http://twitter.com/#!/' + tweet.screen_name + '/status/' + tweet.id,
                profile_url: 'http://twitter.com/#!/' + tweet.screen_name
              });
              // Someday, Twitter will add HTTPS support to twimg.com, but until then
              // we have to rewrite the profile image urls to the old Amazon S3 urls.
              if (window.location.protocol === 'https:') {
                var matches = tweet.profile_image_url.match(/http[s]?:\/\/a[0-9]\.twimg\.com\/(\w+)\/(\w+)\/(.*?)\.(\w+)/i);
                if (matches) {
                  tweet.profile_image_url = "https://s3.amazonaws.com/twitter_production/" + matches[1] + "/" + matches[2] + "/" + matches[3] + "." + matches[4];
                } else {
                  // Failsafe, if profile image url does not match the pattern above
                  // then, at least, change the protocol to HTTPS.
                  // The image may not load, but at least the page stays secure.
                  tweet.profile_image_url = tweet.profile_image_url.replace('http:', 'https:');
                }
              }
            }

            return tweet;
          },

          // Parses the tweet body, linking URLs, #hashtags and @usernames.
          parseText: function (text) {
            // URLs
            text = text.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&\?\/.=]+/g, function (m) {
              return '<a href="' + m + '" rel="external">' + m + '</a>';
            });

            // Twitter
            if (!this.settings.service) {
              // @usernames
              text = text.replace(/@[A-Za-z0-9_]+/g, function (u) {
                return '<a href="http://twitter.com/#!/' + u.replace(/^@/, '') + '" rel="external">' + u + '</a>';
              });
              // #hashtags
              text = text.replace(/#[A-Za-z0-9_\-]+/g, function (u) {
                return '<a href="http://twitter.com/#!/search?q=' + u.replace(/^#/, '%23') + '" rel="external">' + u + '</a>';
              });

            // Other APIs
            } else {
              text = text.replace(/@[A-Za-z0-9_]+/g, function (u) {
                return '<a href="http://' + settings.service + '/' + u.replace(/^@/, '') + '" rel="external">' + u + '</a>';
              });
              text = text.replace(/#[A-Za-z0-9_\-]+/g, function (u) {
                return '<a href="http://' + settings.service + '/search/notice?q?' + u.replace(/^#/, '%23') + '" rel="external">' + u + '</a>';
              });
            }

            return text;
          },

          // Create an object useable by Processing
          toP5: function (tweet) {
            return {
              id: tweet.id,
              profileName: tweet.screen_name,
              profileImageUrl: tweet.profile_image_url,
              text: tweet.text,
              date: this.relativeTime(tweet.created_at)
            };
          },

          // Handle reloading
          refresh: function (initialize) {
            var twitter = this;
            if (twitter.settings.refresh || initialize) {

              $.getJSON(twitter.apiURL(), function (json) {
                // The search and regular APIs differ somewhat
                var results = (twitter.settings.mode === 'search') ? json.results : json;

                $(results).reverse().each(function () {
                  var tweet = this; // twitter.parseTweet(this);

                  // Check if tweets should be filtered
                  if (!twitter.settings.filter || twitter.settings.filter(this)) {
                    // Check if this is actually a new tweet
                    if (Date.parse(tweet.created_at) > twitter.lastTimeStamp) {
                      Pp.tweets.add(twitter.toP5(tweet));

                      // Remember the last timestamp for the next refresh.
                      twitter.lastTimeStamp = Date.parse(tweet.created_at);
                    }
                  }
                });
              });
            }
          },

          // Start refreshing
          start: function () {
            var twitter = this;
            if (!this.interval) {
              this.interval = setInterval(function () {
                twitter.refresh();
              }, twitter.settings.rate);
              this.refresh(true);
            }
          },

          // Stop refreshing
          stop: function () {
            if (this.interval) {
              clearInterval(this.interval);
              this.interval = false;
            }
          },

          // Clear all tweets
          clear: function () {
            this.lastTimeStamp = null;
          }
        };

        var twitter = this.twitter;

        // Update the timestamps in realtime
        this.timeInterval = setInterval(function () {
          twitter.updateTimestamps();
        }, 5000);

        this.twitter.start();
      }
    });
    return this;
  };
})(window.document, Processing);
