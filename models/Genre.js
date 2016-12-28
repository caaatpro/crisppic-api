'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const autoIncrement = require('mongoose-auto-increment');

var Index = mongoose.model('Index');

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
  // Genre.pre('save', function(next) {
  //   var self = this;
  //
  //   if (self.isNew) {
  //     // create a promise (get one from the query builder)
  //     Index.findOne({
  //         'name': 'Genre'
  //       })
  //       .then(function(r) {
  //         console.log('Successful Completion!');
  //
  //         if (r === null) {
  //           var newI = new Index({
  //             name: 'Genre',
  //             sID: 1
  //           });
  //
  //           newI.save()
  //             .then(function() {
  //               self.sID = 1;
  //               next();
  //             }, function(err) {
  //               console.log('Fail Boat');
  //               return next(err);
  //             });
  //
  //         } else {
  //           self.sID = r.sID + 1;
  //
  //           Index.findOneAndUpdate({
  //               name: 'Genre'
  //             }, {
  //               sID: self.sID
  //             })
  //             .then(function() {
  //               next();
  //             }, function(err) {
  //               console.log('Fail Boat');
  //               return next(err);
  //             });
  //         }
  //       }, function(err) {
  //         console.log('Fail Boat');
  //         return next(err);
  //       });
  //   } else {
  //     next();
  //   }
  // });

  mongoose.model('Genre', Genre);
};
