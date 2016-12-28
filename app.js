'use strict';
const pages = require('./controllers/pages'),
      people = require('./controllers/people'),
      movie = require('./controllers/movie'),
      compress = require('koa-compress'),
      logger = require('koa-logger'),
      serve = require('koa-static'),
      route = require('koa-route'),
      koa = require('koa'),
      path = require('path'),
      app = module.exports = koa(),

      mongoose = require('mongoose'),
      ObjectID = require('mongodb').ObjectID,
      autoIncrement = require('mongoose-auto-increment');

require('./models/People')();
require('./models/Genre')();
require('./models/Country')();
require('./models/Movie')();

//setup mongoose
var config = {

};
config.mongodb = {
  uri: 'mongodb://127.0.0.1:27017/movies'
};
mongoose.Promise = global.Promise;
mongoose.connect(config.mongodb.uri, function(err) {
  if (err) {
    throw err;
  }
});

// Logger
app.use(logger());

app.use(route.get('/', pages.home));

app.use(route.get('/people', people.list));
app.use(route.get('/people/:id', people.fetch));
app.use(route.post('/people', people.create));
app.use(route.post('/movie', movie.create));
app.use(route.get('/movie/kinopoisk/:id', movie.kinopoisk));

// Serve static files
app.use(serve(path.join(__dirname, 'public')));

// Compress
app.use(compress());

if (!module.parent) {
  app.listen(7000);
  console.log('listening on port 7000');
}
