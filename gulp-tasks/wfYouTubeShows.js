'use strict';

/*
    wfContributors.js
    Reads the _contributors.yaml file and uses Handlebars to generate the
    primary contributors file and the individual include files.
 */

var fs = require('fs');
var path = require('path');
var gutil = require('gulp-util');
var google = require('googleapis');
var moment = require('moment');
var wfTemplateHelper = require('./wfTemplateHelper');

function buildFeeds() {
  var apiKey = fs.readFileSync('./src/data/youtubeAPIKey.txt', 'utf8');
  var youtube = google.youtube({version: 'v3', auth: apiKey});
  var opts = {
    maxResults: 25,
    part: 'id,snippet',
    playlistId: 'UUnUYZLuoy1rq1aVMwx4aTzw',
  };
  youtube.playlistItems.list(opts, function(err, response) {
    if (err) {
      gutil.log(' ', 'Error, unable to retreive playlist', err);
    } else {
      var articles = [];
      response.items.forEach(function(video) {
        var iframe = '<iframe width="560" height="315" ';
        iframe += 'src="https://www.youtube.com/embed/';
        iframe += video.snippet.resourceId.videoId + '" frameborder="0" ';
        iframe += 'allowfullscreen></iframe>\n<br>\n<br>';
        var content = video.snippet.description.replace(/\n/g, '<br>\n');
        content = iframe + content;
        var result = {
          url: video.snippet.resourceId.videoId,
          title: video.snippet.title,
          description: video.snippet.description,
          image: video.snippet.thumbnails.default,
          datePublished: video.snippet.publishedAt,
          dateUpdated: video.snippet.publishedAt,
          tags: [],
          analyticsUrl: '/web/videos/' + video.snippet.resourceId.videoId,
          content: content,
          atomAuthor: 'Google Developers',
          rssPubDate: moment(video.snippet.publishedAt).format('MM MMM YYYY HH:mm:ss [GMT]')
        };
        articles.push(result);
      });
      var context = {
        title: 'Web Shows - Google Developers',
        description: 'YouTube videos from the Google Chrome Developers team',
        feedRoot: 'https://developers.google.com/web/shows/',
        host: 'https://youtu.be/',
        baseUrl: 'https://youtube.com/user/ChromeDevelopers/',
        analyticsQS: '',
        atomPubDate: moment().format('YYYY-MM-DDTHH:mm:ss[Z]'),
        articles: articles
      };
      var template = path.join(GLOBAL.WF.src.templates, 'atom.xml');
      var outputFile = path.join(GLOBAL.WF.src.content, 'shows', 'atom.xml');
      wfTemplateHelper.renderTemplate(template, context, outputFile);

      template = path.join(GLOBAL.WF.src.templates, 'rss.xml');
      outputFile = path.join(GLOBAL.WF.src.content, 'shows', 'rss.xml');
      wfTemplateHelper.renderTemplate(template, context, outputFile);
    }
  });
}

exports.buildFeeds = buildFeeds;
