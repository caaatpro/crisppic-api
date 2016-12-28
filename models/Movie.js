'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var Index = mongoose.model('Index');

module.exports = function() {
  const Movie = new Schema({
    sID: { type: Number, default: 0 },
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

  Movie.pre('save', function(next) {
    var self = this;

    if (self.isNew) {
      // create a promise (get one from the query builder)
      Index.findOne({
          'name': 'Movie'
        }).exec()
        .then(function(r) {
          console.log('Successful Completion!');

          if (r === null) {
            var newI = new Index({
              name: 'Movie',
              sID: 1
            });

            newI.save().exec()
              .then(function() {
                self.sID = 1;
                next();
              }, function(err) {
                console.log('Fail Boat');
                return next(err);
              });

          } else {
            self.sID = r.sID + 1;

            Index.findOneAndUpdate({
                name: 'Movie'
              }, {
                sID: self.sID
              }).exec()
              .then(function() {
                next();
              }, function(err) {
                console.log('Fail Boat');
                return next(err);
              });
          }
        }, function(err) {
          console.log('Fail Boat');
          return next(err);
        });
    } else {
      next();
    }
  });

  mongoose.model('Movie', Movie);
};
