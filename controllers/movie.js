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
      return new Movie(data).save().then(function() {
        // console.log('Good');
      }, function(err) {
        // console.log('Fail Boat');
        console.log(err);
      });
    } else {
      return r;
    }
  });
};

// module.exports.get = getMovie();

module.exports.kinopoisk = function* kinopoisk(id) {
  var temp = id.match(/\d+/i);
  if (!temp) {
    return;
  }

  const kinopoiskId = temp[0];

  var movie = getMovie({
    'kinopoiskId': kinopoiskId
  }, 1);


  if (movie === null) {
    var parerRes = yield kp.getById(kinopoiskId, null);

    if (parerRes === null) {
      this.status = 404;
      return;
    }

    movie = parerRes;

    var Genre = mongoose.model('Genre');
    var total = parerRes.genre.length;
    var genreDB = [];


    var g = [];
    for (var i in parerRes.genre) {
      g.push({
        'title.russian': parerRes.genre[i]
      });
    }

    var genreSave = yield Genre.find({ $or: g })
      .then(result => {
        return result;
      })
      .catch(function(err) {
        console.log(err);
      });

    genreDB = genreSave;

    for (var i in genreDB) {
      parerRes.genre.splice(parerRes.genre.indexOf(genreDB[i].title.russian), 1);
    }
    for (var ii in parerRes.genre) {
      // console.log(parerRes.genre[ii]);

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
    for (var id in genreDB) {
      genreIds.push(genreDB[id]._id);
    }

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
      country: [{
        // type: mongoose.Schema.Types.ObjectId,
        ref: 'Country'
      }],
      peoples: [{
        people: {
          // type: mongoose.Schema.Types.ObjectId,
          ref: 'People'
        },
        role: '',
        category: ''
      }],
      runtime: parerRes.runtime,
      year: parerRes.year,
      released: [{
        country: String,
        date: Date,
        description: String
      }],
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

    this.body = data;

    // return new Movie(data).save().then(function(body) {
    //   // console.log('Good');
    //   this.body = data;
    // }, function(err) {
    //   // console.log('Fail Boat');
    //   console.log(err);
    // });



    // var d = {
    //
    //   "actors": [
    //     "Шон Пенн",
    //     "Мишель Пфайффер",
    //     "Дакота Фаннинг",
    //     "Дайэнн Уист",
    //     "Лоретта Дивайн",
    //     "Ричард Шифф",
    //     "Лора Дерн",
    //     "Брэд Силверман",
    //     "Джозеф Розенберг",
    //     "Стэнли ДеСантис"
    //   ],
    //   "country": [
    //     "США"
    //   ],
    //   "director": [
    //     "Джесси Нельсон"
    //   ],
    //   "scenario": [
    //     "Кристин Джонсон",
    //     "Джесси Нельсон"
    //   ],
    //   "producer": [
    //     "Маршалл Херсковиц",
    //     "Джесси Нельсон",
    //     "Ричард Соломон"
    //   ],
    //   "operator": [
    //     "Эллиот Дэвис"
    //   ],
    //   "composer": [
    //     "Джон Пауэлл"
    //   ],
    //   "cutting": [
    //     "Ричард Чю"
    //   ],
    //   "genre": [
    //     "драма"
    //   ]
    // };
  }

};
