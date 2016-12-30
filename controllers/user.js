'use strict';

const mongoose = require('mongoose');

function getProfile(username) {
  var User = mongoose.model('User');

  return User.findOne({
    'username': username
  });
}

module.exports.profile = function* profile(username) {
  var profile = yield getProfile(username);
  if (profile === null) {
    this.status = 404;
    return;
  }

  this.body = profile;
  yield {};
};

module.exports.movies = function* movies(username) {
  var profile = yield getProfile(username);
  if (profile === null) {
    this.status = 404;
    return;
  }

  var UserMovie = mongoose.model('UserMovie');
  var movie = yield UserMovie.find({
    'userId': profile._id
  }).limit(20).populate('movieId');

  this.body = movie;
  yield {};
};

module.exports.addMovie = function* addMovie(id) {
  console.log(id);
  // tempStart
  var profile = yield getProfile('caaatpro');
  console.log(profile);
  // tempEnd

  var Movie = mongoose.model('Movie');
  var movie = yield Movie.findOne({
    'sID': id
  });
  console.log(movie._id);

  if (movie === null) {
    this.status = 404;
    return;
  }

  var data = {
    userId: profile._id,
    movieId: movie._id,
    date: null,
    view: false
  };

  var UserMovie = mongoose.model('UserMovie');

  this.body = yield new UserMovie(data).save()
    .then(function() {
      return {
        'result': 'ok'
      };
    })
    .catch(function(err) {
      console.log(err);
      return {
        'result': 'error'
      };
    });
  yield {};
};

module.exports.deleteMovie = function* deleteMovie(id) {
  console.log(id);
  // tempStart
  var profile = yield getProfile('caaatpro');
  console.log(profile);
  // tempEnd

  var UserMovie = mongoose.model('UserMovie');
  this.body = yield UserMovie.findOne({
      'sID': id
    }).remove()
    .then(function() {
      return {
        'result': 'ok'
      };
    })
    .catch(function(err) {
      console.log(err);
      return {
        'result': 'error'
      };
    });

  yield {};
};

module.exports.directors = function* directors(username) {
  var profile = yield getProfile(username);
  if (profile === null) {
    this.status = 404;
    return;
  }

  // var UserMovie = mongoose.model('UserMovie');
  // var movie = yield UserMovie.find({
  //   'userId': profile._id
  // }, 'movieId').limit(20).populate('movieId').populate('movieId.peoples');
  //
  // console.log(movie[0].movieId.peoples);
  //
  // var directors = [];

  this.body = 'User directors';
  yield {};
};

module.exports.actors = function* actors(username) {
  var profile = yield getProfile(username);
  if (profile === null) {
    this.status = 404;
    return;
  }

  this.body = 'User actors';
  yield {};
};

module.exports.create = function* create() {
  var data = {
    username: 'caaatpro',
    password: '123456',
    email: 'caaatpro@gmail.com',
    roles: String,
    isActive: true,
  };

  var User = mongoose.model('User');
  var user = yield new User(data).save()
    .then(function(body) {
      return body;
    }, function(err) {
      console.log('Fail Boat');
      console.log(err);
      return;
    });

  this.body = user;
  yield {};
};
