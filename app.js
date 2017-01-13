'use strict';
const pages = require('./controllers/pages'),
  people = require('./controllers/people'),
  movie = require('./controllers/movie'),
  user = require('./controllers/user'),
  compress = require('koa-compress'),
  logger = require('koa-logger'),
  serve = require('koa-static'),
  route = require('koa-route'),
  Koa = require('koa'),
  path = require('path'),
  app = module.exports = new Koa(),
  CSRF = require('koa-csrf').default,
  fs = require('fs'),
  bodyParser = require('koa-bodyparser'),

  mongoose = require('mongoose'),
  ObjectID = require('mongodb').ObjectID,

  // sessions
  convert = require('koa-convert'),
  session = require('koa-generic-session'),
  MongoStore = require('koa-generic-session-mongo'),

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

// sessions
app.keys = ['a', 'b'];
app.use(convert(session({
  store: new MongoStore({
    host: config.db.host,
    post: config.db.post,
    db: 'sessions'
  })
})));

app.use(bodyParser());

// csrf
// app.use(new CSRF({
//   invalidSessionSecretMessage: 'Invalid session secret',
//   invalidSessionSecretStatusCode: 403,
//   invalidTokenMessage: 'Invalid CSRF token',
//   invalidTokenStatusCode: 403
// }));

// authentication
require('./controllers/auth');
app.use(passport.initialize());
app.use(passport.session());

// Logger
app.use(convert(logger()));

app.isAuthenticated = function(ctx, returnCode = false) {
  if (ctx.isAuthenticated()) {
    console.log(ctx.user);
    return true;
  } else {
    if (returnCode) {
      ctx.status = 401;
      ctx.body = {
        success: false
      };
    }
    return false;
  }
};

// Login
app.use(route.get('/signin', function(ctx) {
  if (!app.isAuthenticated(ctx)) {
    ctx.type = 'html';
    ctx.body = fs.readFileSync('public/signin.html', 'utf8');
  } else {
    ctx.redirect('/');
  }
}));

app.use(route.post('/login',
  function(ctx, next) {
  return passport.authenticate('local', function (err, user) {
      if (user === false) {
        ctx.body = {
          success: false
        };
        ctx.status = 401;
      } else {
        ctx.body = {
          success: true
        };
      }
    })(ctx, next);
  }
));

app.use(route.post('/login2',
  function(ctx, next) {
  return passport.authenticate('jsx', function (err, user) {
      if (user === false) {
        ctx.body = {
          success: false
        };
        ctx.status = 401;
      } else {
        ctx.body = {
          success: true
        };
      }
    })(ctx, next);
  }
));

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

app.use(route.post('/profile', passport.authenticate('jwt', { session: false}),
    function(ctx) {
        ctx.body = ctx.user.profile;
    }
));

// Logout
app.use(route.get('/logout', function(ctx) {
  ctx.logout();
  ctx.redirect('/');
}));

// app.use(route.all('/', pages.home));

// Serve static files
app.use(route.all('/', function(ctx) {
  if (app.isAuthenticated(ctx, true)) {
    ctx.type = 'html';
    ctx.body = fs.createReadStream('public/app.html');
  }
}));


app.use(route.get('/people', convert(people.list)));
app.use(route.get('/people/:id', convert(people.fetch)));
// app.use(route.post('/people', people.create));
// app.use(route.post('/movie', movie.create));
app.use(route.get('/movie/kinopoisk/:id', convert(movie.kinopoisk)));

// app.use(route.post('/user/create', user.create));
app.use(route.get('/user/:username', convert(user.profile)));
app.use(route.get('/user/:username/movies', convert(user.movies)));
app.use(route.get('/user/:username/actors', convert(user.actors)));
app.use(route.get('/user/:username/directors', convert(user.directors)));

app.use(route.put('/user/movie/:id', convert(user.addMovie)));
app.use(route.delete('/user/movie/:id', convert(user.deleteMovie)));

// Compress
app.use(convert(compress()));

if (!module.parent) {
  app.listen(7000);
  console.log('listening on port 7000');
}
