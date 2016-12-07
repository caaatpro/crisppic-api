'use strict';
const views = require('co-views');
const parse = require('co-body');
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


module.exports.list = function* list() {
  this.body = yield messages;
};

module.exports.fetch = function* fetch(id) {
  const message = messages[id];
  if (!message) {
    this.throw(404, 'message with id = ' + id + ' was not found');
  }
  this.body = yield message;
};

module.exports.create = function* create() {
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
