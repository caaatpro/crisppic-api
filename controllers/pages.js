'use strict';

const mongoose = require('mongoose');

module.exports.home = function *() {

  var People = mongoose.model('People');

  // define some dummy data
  let data = new People({
      name: {
        russian: 'Русское имя',
        original: 'Английское имя'
      },
      sID: 0,
      imdbID: '1'
  });

  var f = yield data.save();
  this.body = f;
};
