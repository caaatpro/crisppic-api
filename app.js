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

  // sessions
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
    host: '127.0.0.1',
    post: '27017',
    movies: 'movies',
    sessions: 'sessions',

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
    success: true
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


// search movie
//
router.get('/user/profile', convert(user.profile));
router.get('/user/:username', convert(user.profileByName));
router.get('/users', convert(user.users));

router.get('/user/profile/movies', convert(user.movies));
router.get('/user/:username/movies', convert(user.movies));

router.put('/user/movie/:id', convert(user.addMovie));
router.delete('/user/movie/:id', convert(user.deleteMovie));


router.get('/user/profile', convert(user.profile));


app.use(route.get('/people', convert(people.list)));
app.use(route.get('/people/:id', convert(people.fetch)));
// app.use(route.post('/people', people.create));
// app.use(route.post('/movie', movie.create));
app.use(route.get('/movie/kinopoisk/:id', convert(movie.kinopoisk)));

// app.use(route.post('/user/create', user.create));


// Compress
app.use(convert(compress()));

if (!module.parent) {
  app.listen(7000);
  console.log('listening on port 7000');
}
