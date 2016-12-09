'use strict';
const parse = require('co-body');
const mongoose = require('mongoose');

module.exports.create = function* create() {
  // console.log(this);
  var req = yield parse(this);

  var Movie = mongoose.model('Movie');

  var data = {
    titles: [{
      country: 'original',
      title: req.title
    }],
    type: req.type,
    version: req.version,
    suspended: '',
    year: 0,
    episode: {
      titles: [{
        country: 'original',
        title: ''
      }],
      season: 0,
      number: 0,
      format: '',
      year: 0
    }
  };

  if (req.year === '????') {
    data.year = 0;
  } else {
    data.year = req.year;
  }

  console.log(req.year);
  console.log(data.year);

  if (req.type === 'series' || req.type === 'movie') {
    data.suspended = req.suspended;

  }

  if (req.type === 'movie') {
    data.format = req.format;
  }

  if (req.type === 'series') {
    data.running = req.running;
  }

  if (req.type === 'episode') {
    if (!req.episode) {
      return 'Error';
    }
    if (req.episode.season) {
      data.episode.season = req.episode.season.replace('\'', '');
    }
    if (req.episode.number !== undefined) {
      data.episode.number = req.episode.number.replace('\'', '');
    }
    data.episode.format = req.episode.format;

    data.episode.titles = [{
      country: 'original',
      title: data.episode.title
    }];

    if (req.episode.year === '????') {
      data.episode.year = 0;
    } else {
      data.episode.year = req.episode.year;
    }
  }


  this.body = yield Movie.findOne({
    year: data.year,
    titles: {
      $elemMatch: {
        country: 'original',
        title: data.title
      }
    },
    type: data.type,
    version: data.version
  }).exec(function(err, r) {
    if (err) {
      console.log(err);
    }

    // console.log(r);

    if (r === null) {
      return new Movie(data).save().then(function() {
        // console.log('Good');
      }, function(err) {
        // console.log('Fail Boat');
        console.log(err);
      });
    } else {
      return r;
    }
  });
};
