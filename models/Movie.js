'use strict';

const mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      autoIncrement = require('mongoose-auto-increment');

module.exports = function() {
  const Movie = new Schema({
    sID: {
      type: Number,
      default: 0
    },
    titles: [{
      country: String,
      title: String
    }],
    description: [{
      country: String,
      description: String
    }],
    poster: [{
      country: String,
      url: String
    }],
    genre: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Genre'
    }],
    country: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country'
    }],
    peoples: [{
      people: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'People'
      },
      role: '',
      category: ''
    }],
    runtime: Number,
    year: Number,
    released: [{
      country: String,
      date: Date,
      description: String
    }],
    imdbID: String,
    kinopoiskID: String,
    dateUpdate: {
      type: Date,
      default: Date.now
    },
    rating: [{
      name: String,
      value: String
    }],
    type: {
      type: String,
      default: 'movie'
    },
    version: {
      type: String,
      default: ''
    },
    suspended: {
      type: String,
      default: ''
    },
    episode: {
      titles: [{
        country: String,
        title: String
      }],
      season: Number,
      number: Number,
      format: String,
      year: Number
    }
  });

  autoIncrement.initialize(mongoose);
  Movie.plugin(autoIncrement.plugin, {
    model: 'Movie',
    field: 'sID',
    startAt: 1,
    incrementBy: 1
  });

  mongoose.model('Movie', Movie);
};
