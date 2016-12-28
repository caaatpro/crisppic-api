'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const autoIncrement = require('mongoose-auto-increment');

module.exports = function() {
  var Country = new Schema({
    sID: {
      type: Number,
      default: 0
    },

    iso_3166_1: String,
    name: {
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
  Country.plugin(autoIncrement.plugin, {
    model: 'Country',
    field: 'sID',
    startAt: 1,
    incrementBy: 1
  });

  mongoose.model('Country', Country);
};
