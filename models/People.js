'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var Index = mongoose.model('Index');

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

  People.pre('save', function(next) {
    var self = this;

    if (self.isNew) {
      // create a promise (get one from the query builder)
      Index.findOne({
          'name': 'People'
        }).exec()
        .then(function(r) {
          console.log('Successful Completion!');

          if (r === null) {
            var newI = new Index({
              name: 'People',
              sID: 1
            });

            newI.save().exec()
              .then(function() {
                console.log('Successful Completion!');
                self.sID = 1;
                next();
              }, function(err) {
                console.log('Fail Boat');
                return next(err);
              });

          } else {
            self.sID = r.sID + 1;

            Index.findOneAndUpdate({
                name: 'People'
              }, {
                sID: self.sID
              }).exec()
              .then(function() {
                console.log('Successful Completion!');
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

  mongoose.model('People', People);
};
