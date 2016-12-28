'use strict';

const mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      autoIncrement = require('mongoose-auto-increment');

module.exports = function() {
  const People = new Schema({
    name: {
      russian: {
        type: String,
        default: ''
      },
      original: {
        type: String,
        default: ''
      }
    },
    photo: {
      type: String,
      default: ''
    },
    birth: {
      date: {
        type: Date,
        default: null
      },
      place: {
        type: String,
        default: ''
      }
    },
    bio: {
      type: String,
      default: ''
    },
    sID: {
      type: Number,
      default: 0
    },
    links: {
      kinopoisk: {
        type: String,
        default: ''
      },
      IMDB: {
        type: String,
        default: ''
      }
    }
  });

  autoIncrement.initialize(mongoose);
  People.plugin(autoIncrement.plugin, {
    model: 'People',
    field: 'sID',
    startAt: 1,
    incrementBy: 1
  });

  mongoose.model('People', People);
};
