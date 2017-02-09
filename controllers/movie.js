'use strict';
const parse = require('co-body');
const mongoose = require('mongoose');
const kp = require('../parser/kinopoisk.js');

function getMovie(options, limit) {
  var Movie = mongoose.model('Movie');
  var select = {};

  if (!options.kinopoiskID) {
    return null;
  } else {
    select.kinopoiskID = options.kinopoiskID;
  }


  if (!limit) {
    limit = 1;
  } else if (limit > 20) {
    limit = 20;
  }

  return Movie.find(select).limit(limit)
    .then(function(r) {
      return r;
    })
    .catch(function(err) {
      return new Error(err);
    });
}


module.exports.list = function* list() {
  var Movie = mongoose.model('Movie');

  var r = yield Movie.find({}, 'year type poster titles country genre')
    .populate('country')
    .populate('genre')
    .limit(200);

  var movies = [];

  for (var i = 0; i < r.length; i++) {
    var titles = {};
    for (var j = 0; j < r[i].titles.length; j++) {
      titles[r[i].titles[j].country] = r[i].titles[j].title;
    }
    movies.push({
      'titles': titles,
      'year': r[i].year,
      'type': r[i].type,
      'poster': r[i].poster,
      'country': r[i].country,
      'genre': r[i].genre
    });
  }

  this.body = movies;
};

module.exports.create = function* create() {
  var Movie = mongoose.model('Movie');
  var req = yield parse(this);

  var data = {
    titles: [{
      country: 'original',
      title: req.title
    }],
    type: req.type,
    version: req.version,
    suspended: '',
    year: 0,
    episode: {
      titles: [{
        country: 'original',
        title: ''
      }],
      season: 0,
      number: 0,
      format: '',
      year: 0
    }
  };

  if (req.year === '????') {
    data.year = 0;
  } else {
    data.year = req.year;
  }

  if (req.type === 'series' || req.type === 'movie') {
    data.suspended = req.suspended;

  }

  if (req.type === 'movie') {
    data.format = req.format;
  }

  if (req.type === 'series') {
    data.running = req.running;
  }

  if (req.type === 'episode') {
    if (!req.episode) {
      return 'Error';
    }
    if (req.episode.season) {
      data.episode.season = req.episode.season.replace('\'', '');
    }
    if (req.episode.number !== undefined) {
      data.episode.number = req.episode.number.replace('\'', '');
    }
    data.episode.format = req.episode.format;

    data.episode.titles = [{
      country: 'original',
      title: data.episode.title
    }];

    if (req.episode.year === '????') {
      data.episode.year = 0;
    } else {
      data.episode.year = req.episode.year;
    }
  }

  this.body = yield Movie.findOne({
    year: data.year,
    titles: {
      $elemMatch: {
        country: 'original',
        title: data.title
      }
    },
    type: data.type,
    version: data.version
  }).exec(function(err, r) {
    if (err) {
      console.log(err);
    }

    if (r === null) {
      return new Movie(data).save().then(function() {}, function(err) {
        console.log(err);
      });
    } else {
      return r;
    }
  });
};

module.exports.kinopoisk = function* kinopoisk() {
  var temp = this.params.id.match(/\d+/i);
  if (!temp) {
    this.status = 404;
    return;
  }

  const kinopoiskID = temp[0];

  var movie = yield getMovie({
    'kinopoiskID': kinopoiskID
  }, 1);

  if (movie.length === 0) {
    var parerRes = yield kp.getById(kinopoiskID, null);

    if (parerRes === null) {
      this.status = 404;
      return;
    }

    movie = parerRes;

    // Genre
    var Genre = mongoose.model('Genre');
    var genreDB = [];

    var g = [];
    for (var i in parerRes.genre) {
      g.push({
        'title.russian': parerRes.genre[i]
      });
    }

    var genreSave = yield Genre.find({
        $or: g
      })
      .then(result => {
        return result;
      })
      .catch(function(err) {
        console.log(err);
      });

    genreDB = genreSave;

    for (var j in genreDB) {
      parerRes.genre.splice(parerRes.genre.indexOf(genreDB[j].title.russian), 1);
    }
    for (var ii in parerRes.genre) {
      var gg = yield new Genre({
          title: {
            russian: parerRes.genre[ii]
          }
        }).save()
        .then(result2 => {
          return result2;
        });

      genreDB.push(gg);
    }

    var genreIds = [];
    for (var k in genreDB) {
      genreIds.push(genreDB[k]._id);
    }

    // Country
    var Country = mongoose.model('Country');
    var countryDB = [];

    var c = [];
    for (var i2 in parerRes.country) {
      c.push({
        'name.russian': parerRes.country[i2]
      });
    }

    var countrySave = yield Country.find({
        $or: c
      })
      .then(result => {
        return result;
      })
      .catch(function(err) {
        console.log(err);
      });

    countryDB = countrySave;

    for (var j2 in countryDB) {
      parerRes.country.splice(parerRes.country.indexOf(countryDB[j2].name.russian), 1);
    }
    for (var ii2 in parerRes.country) {
      var cc = yield new Country({
          name: {
            russian: parerRes.country[ii2]
          }
        }).save()
        .then(result2 => {
          return result2;
        });

      countryDB.push(cc);
    }

    var countryIds = [];
    for (var k2 in countryDB) {
      countryIds.push(countryDB[k2]._id);
    }

    // People
    var People = mongoose.model('People');
    var peopleDB = [];

    var p = [];
    var onlyName = [];
    for (var i3 in parerRes.peoples) {
      if (onlyName.indexOf(parerRes.peoples[i3].people) === -1) {
        onlyName.push(parerRes.peoples[i3].people);

        p.push({
          'name.russian': parerRes.peoples[i3].people
        });
      }
    }

    var peopleSave = yield People.find({
        $or: p
      })
      .then(result => {
        return result;
      })
      .catch(function(err) {
        console.log(err);
      });

    peopleDB = peopleSave;

    for (var j3 in peopleDB) {
      onlyName.splice(parerRes.peoples.indexOf(peopleDB[j3].name.russian), 1);
    }

    for (var ii3 in onlyName) {
      var pp = yield new People({
          name: {
            russian: onlyName[ii3]
          }
        }).save()
        .then(result2 => {
          return result2;
        });

      peopleDB.push(pp);
    }

    for (var k3 in peopleDB) {
      parerRes.peoples.filter(function(item) {
        if (item.people === peopleDB[k3].name.russian) {
          item.people = peopleDB[k3]._id;
        }
      });
    }

    // Movie
    var data = {
      titles: [{
        country: 'russian',
        title: parerRes.title
      }, {
        country: 'original',
        title: parerRes.alternativeTitle
      }],
      description: [{
        country: 'russian',
        description: parerRes.description
      }],
      genre: genreIds,
      country: countryIds,
      peoples: parerRes.peoples,
      runtime: parerRes.runtime,
      year: parerRes.year,
      kinopoiskID: parerRes.id,
      rating: [{
        name: 'kinopoiskVotes',
        value: parerRes.votes
      }, {
        name: 'kinopoiskRating',
        value: parerRes.rating
      }],
      type: parerRes.type
    };

    var Movie = mongoose.model('Movie');
    movie = yield new Movie(data).save()
      .then(function(body) {
        return body;
      }, function(err) {
        console.log('Fail Boat');
        console.log(err);
        return;
      });

  } else {
    movie = movie[0];
  }


  var titles = {};
  console.log(movie.titles);
  for (var x = 0; x < movie.titles.length; x++) {
    titles[movie.titles[x].country] = movie.titles[x].title;
  }
  var movieInfo = {
    'titles': titles,
    'year': movie.year,
    'type': movie.type,
    'poster': movie.poster,
    'country': movie.country,
    'genre': movie.genre
  };

  this.body = movieInfo;
};
