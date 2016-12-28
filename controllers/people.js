'use strict';
const mongoose = require('mongoose');

module.exports.list = function* list() {
  var People = mongoose.model('People');

  var r = yield People.find({}).limit(200);
  this.body = r;
};

module.exports.fetch = function* fetch(id) {
  var People = mongoose.model('People');

  var r = yield People.findOne({
    'sID': id
  });

  if (r !== null) {
    this.body = r;
  }
};
