'use strict';
const views = require('co-views');
const parse = require('co-body');
const mongoose = require('mongoose');

const messages = [{
  id: 0,
  message: 'Koa next generation web framework for node.js'
}, {
  id: 1,
  message: 'Koa is a new web framework designed by the team behind Express'
}];

const render = views(__dirname + '/../views', {
  map: {
    html: 'swig'
  }
});

module.exports.create = function *create() {
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

  var r = yield data.save();
  this.body = r;
};

module.exports.list = function* list() {
  var People = mongoose.model('People');

  var r = yield People.find({}).limit(200);
  this.body = r;
};

module.exports.list = function* list() {
  var People = mongoose.model('People');

  var r = yield People.find({}).limit(200);
  this.body = r;
};

module.exports.fetch = function* fetch(id) {
  var People = mongoose.model('People');

  var r = yield People.findOne({ 'sID':  id});

  if (r !== null) {
    this.body = r;
  }
};

module.exports.create2 = function* create2() {
  const message = yield parse(this);
  const id = messages.push(message) - 1;
  message.id = id;

  db.models.Index.findOne({ 'name': 'People' }).exec(function(err, r) {
    if (err) return next(err);

    if (r == null) {
        var newI = new db.models.Index({
            name: 'People',
            sID: 1
        });
        newI.save(function (err, r) {
          if (err) {
            console.log(err);
          }

          self.sID = 1;
          next();
        });
    } else {
      self.sID = r.sID+1;

      db.models.Index.findOneAndUpdate({ name: 'People' }, { sID: self.sID }, function (err, r) {
        if (err) return next(err);

        next();
      });
    }
  });

  // db.models.People.findOne({
  //   'imdbID': peoplesDB[i].imdbID
  // }).exec(function(err, people) {
  //   if (err) {
  //     console.log('Error', err);
  //     return;
  //   }
  //
  //   if (people === null) {
  //     var fieldsToSet = {
  //       name: {
  //         russian: '',
  //         original: peoplesDB[i].name
  //       },
  //       imdbID: peoplesDB[i].imdbID
  //     };
  //
  //     db.models.People.create(fieldsToSet, function(err, people) {
  //       if (err) {
  //         console.log('Error', err);
  //         return false;
  //       }
  //
  //       updatePeopleInMovie(i, total, people);
  //     });
  //   } else {
  //     updatePeopleInMovie(i, total, people);
  //   }
  // });

  this.redirect('/');
};
