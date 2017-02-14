'use strict';

const mongoose = require('mongoose'),
  // ObjectId = require('mongodb').ObjectID;
  movie = require('./movie');

function getProfile(username) {
  var User = mongoose.model('User');

  return User.findOne({
    'username': username
  }, 'username');
}

// var self = module.exports;

// Profile
module.exports.profile = function* profile() {

  var profile = yield getProfile(this.user.username);
  this.body = profile;
  yield {};
};

// Get user by name
module.exports.profileByName = function* profileByName() {
  var profile = yield getProfile(this.params.username);
  if (profile === null) {
    this.status = 404;
    return;
  }

  this.body = profile;
  yield {};
};

// All users
module.exports.users = function* users() {
  var User = mongoose.model('User');

  var users = yield User.find({});

  this.body = users;
  yield {};
};

// Get views
module.exports.views = function* views() {
  var profile;

  if (this.params === undefined || this.params.username === undefined) {
    this.status = 404;
    return;
  } else {
    profile = yield getProfile(this.params.username);
    if (profile === null) {
      this.status = 404;
      return;
    }
  }

  var UserMovie = mongoose.model('UserMovie');
  var movies = yield UserMovie.find({
    'user': profile._id,
    'view': true
  }).populate('movie');

  var userMovies = [];
  for (var id in movies) {
    if (movies.hasOwnProperty(id)) {
      var titles = {};
      for (var x = 0; x < movies[id].movie.titles.length; x++) {
        titles[movies[id].movie.titles[x].country] = movies[id].movie.titles[x].title;
      }

      userMovies.push({
        'titles': titles,
        'sID': movies[id].sID,
        'movie': {
          'sID': movies[id].movie.sID
        },
        'year': movies[id].movie.year,
        'type': movies[id].movie.type,
        'view': movies[id].view,
        'date': movies[id].date
      });
    }
  }

  this.body = userMovies;
  yield {};
};

// Get wants
module.exports.wants = function* wants() {
  var profile;

  if (this.params === undefined || this.params.username === undefined) {
    this.status = 404;
    return;
  } else {
    profile = yield getProfile(this.params.username);
    if (profile === null) {
      this.status = 404;
      return;
    }
  }

  var UserMovie = mongoose.model('UserMovie');
  var movies = yield UserMovie.find({
    'user': profile._id,
    'view': false
  }).populate('movie');

  var userMovies = [];
  for (var id in movies) {
    if (movies.hasOwnProperty(id)) {
      var titles = {};
      for (var x = 0; x < movies[id].movie.titles.length; x++) {
        titles[movies[id].movie.titles[x].country] = movies[id].movie.titles[x].title;
      }

      userMovies.push({
        'titles': titles,
        'movie': {
          'sID': movies[id].movie.sID
        },
        'sID': movies[id].sID,
        'year': movies[id].movie.year,
        'type': movies[id].movie.type,
        'view': movies[id].view,
        'date': movies[id].date
      });
    }
  }

  this.body = userMovies;
  yield {};
};


// add user movie
module.exports.addViewsKinopoisk = function* addViewsKinopoisk() {
  movie.params = this.params;
  module.exports.user = this.user;
  module.exports.params = this.params;
  module.exports.query = this.query;

  var r = yield movie.kinopoisk(true);

  module.exports.params = {
    id: r.sID,
    view: true
  };

  this.body = yield module.exports.addViews();
};
// add user movie
module.exports.addWantsKinopoisk = function* addWantsKinopoisk() {
  movie.params = this.params;
  module.exports.user = this.user;
  module.exports.params = this.params;
  module.exports.query = this.query;

  var r = yield movie.kinopoisk(true);

  module.exports.params = {
    id: r.sID,
    view: false
  };

  this.body = yield module.exports.addViews();
};

// Добавление просмотра
module.exports.addViews = function* addViews() {
  var profile = yield getProfile(this.user.username);

  var Movie = mongoose.model('Movie');
  var movie = yield Movie.findOne({
    'sID': this.params.id
  });

  if (movie === null) {
    this.status = 404;
    return;
  }

  var view = true;
  if (typeof(this.params.view) !== 'undefined') {
    view = this.params.view;
  }

  var date = null;
  if (this.query.date != null) {
    date = new Date(this.query.date);
  }

  var data = {
    user: profile._id,
    movie: movie._id,
    date: date,
    view: view
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
  return this.body;
};

// Добавление хочу
module.exports.addWants = function* addWants() {
  var profile = yield getProfile(this.user.username);

  var Movie = mongoose.model('Movie');
  var movie = yield Movie.findOne({
    'sID': this.params.id
  });

  if (movie === null) {
    this.status = 404;
    return;
  }

  var data = {
    user: profile._id,
    movie: movie._id,
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
  return this.body;
};

// Remove user movie
module.exports.removeViews = function* removeViews() {
  var profile = yield getProfile(this.user.username);

  var UserMovie = mongoose.model('UserMovie');
  this.body = yield UserMovie.remove({
      'sID': this.params.id,
      'view': true,
      'user': profile._id
    })
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

// Remove user movie
module.exports.removeWants = function* removeWants() {
  var profile = yield getProfile(this.user.username);

  console.log(this.params.id);

  var UserMovie = mongoose.model('UserMovie');
  this.body = yield UserMovie.remove({
      'sID': this.params.id,
      'view': false,
      'user': profile._id
    })
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
