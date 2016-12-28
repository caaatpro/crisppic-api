'use strict';

const mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      autoIncrement = require('mongoose-auto-increment');

module.exports = function() {
  var Genre = new Schema({
    sID: {
      type: Number,
      default: 0
    },
    title: {
      russian: {
        type: String,
        default: ''
      },
      original: {
        type: String,
        default: ''
      }
    }
  });

  autoIncrement.initialize(mongoose);
  Genre.plugin(autoIncrement.plugin, {
    model: 'Genre',
    field: 'sID',
    startAt: 1,
    incrementBy: 1
  });

  mongoose.model('Genre', Genre);
};
