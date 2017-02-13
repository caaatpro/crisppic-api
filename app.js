'use strict';
const pages = require('./controllers/pages'),
  people = require('./controllers/people'),
  movie = require('./controllers/movie'),
  user = require('./controllers/user'),
  compress = require('koa-compress'),
  logger = require('koa-logger'),
  route = require('koa-route'),
  Koa = require('koa'),
  app = module.exports = new Koa(),
  fs = require('fs'),
  bodyParser = require('koa-bodyparser'),

  router = require('koa-router')(),

  mongoose = require('mongoose'),

  convert = require('koa-convert'),

  passport = require('koa-passport');

require('./models/User')();
require('./models/UserMovie')();
require('./models/People')();
require('./models/Genre')();
require('./models/Country')();
require('./models/Movie')();

//setup mongoose
var config = {
  db: {
    host: '85.143.213.70',
    post: '27272',
    movies: 'movies'
  }
};
config.mongodb = {
  uri: 'mongodb://' + config.db.host + ':' + config.db.post + '/' + config.db.movies
};
mongoose.Promise = global.Promise;
mongoose.connect(config.mongodb.uri, function(err) {
  if (err) {
    throw err;
  }
});

app.use(bodyParser());

// authentication
require('./controllers/auth');
app.use(passport.initialize());

// Logger
app.use(convert(logger()));

// Registration
app.use(route.get('/signup', function(ctx) {
  if (!app.isAuthenticated) {
    ctx.type = 'html';
    ctx.body = fs.readFileSync('public/signup.html', 'utf8');
  } else {
    ctx.redirect('/');
  }
}));
app.use(route.post('/signup',
  passport.authenticate('local-signup', {
    successRedirect: '/',
    failureRedirect: '/signup'
  })
));

// Middleware authentication
app.use(function(ctx, next) {
  return passport.authenticate('basic', {
    session: false
  }, function(err, user) {
    if (user === false) {
      ctx.body = {
        success: false
      };
      ctx.status = 401;
    } else {
      ctx.user = user;
      console.log(user);
      return next();
    }
  })(ctx, next);
});

app
  .use(router.routes())
  .use(router.allowedMethods());

// Login
app.use(route.get('/login', function(ctx) {
  ctx.body = {
    username: ctx.user.username
  };
}));

// Logout
app.use(route.get('/logout', function(ctx) {
  ctx.logout();
  ctx.redirect('/');
}));

// app.use(route.all('/', pages.home));

// Serve static files
app.use(route.all('/', function(ctx) {
  ctx.type = 'html';
  ctx.body = fs.createReadStream('public/app.html');
}));

// Users
router.get('/users', convert(user.users));

// User
router.get('/user/:username', convert(user.profileByName));
router.get('/user/:username/views', convert(user.views));
router.get('/user/:username/wants', convert(user.wants));

router.put('/user/views/:id', convert(user.addViews));
router.put('/user/wants/:id', convert(user.addWants));

router.delete('/user/views/:id', convert(user.removeViews));
router.delete('/user/wants/:id', convert(user.removeWants));

router.put('/user/movie/kinopoisk/:id', convert(user.addMovieKinopoisk));

// Movies
router.get('/movies', convert(movie.list));
router.get('/movie/:id', convert(movie.movie));

// Parser
router.put('/movie/kinopoisk/:id', convert(movie.kinopoisk));

app.use(route.get('/people', convert(people.list)));

app.use(route.get('/people/:id', convert(people.fetch)));
// app.use(route.post('/people', people.create));
// app.use(route.post('/movie', movie.create));

// app.use(route.post('/user/create', user.create));


// Compress
app.use(convert(compress()));

if (!module.parent) {
  app.listen(7000);
  console.log('listening on port 7000');
}
