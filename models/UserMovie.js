'use strict';

const mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  autoIncrement = require('mongoose-auto-increment');

module.exports = function() {
  var UserMovie = new Schema({
    sID: {
      type: Number,
      default: 0
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie'
    },
    date: {
      type: Date,
      default: null
    },
    view: Boolean,
    dateUpdate: {
      type: Date,
      default: Date.now
    }
  });

  autoIncrement.initialize(mongoose);
  UserMovie.plugin(autoIncrement.plugin, {
    model: 'UserMovie',
    field: 'sID',
    startAt: 1,
    incrementBy: 1
  });

  mongoose.model('UserMovie', UserMovie);
};
