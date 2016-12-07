'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = function() {
  const Index = new Schema({
    name: { type: String, default: '' },
    sID: { type: Number, default: 0 }
  });

  mongoose.model('Index', Index);
};
