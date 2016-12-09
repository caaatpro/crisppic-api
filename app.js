'use strict';
const pages = require('./controllers/pages');
const people = require('./controllers/people');
const movie = require('./controllers/movie');
const compress = require('koa-compress');
const logger = require('koa-logger');
const serve = require('koa-static');
const route = require('koa-route');
const koa = require('koa');
const path = require('path');
const app = module.exports = koa();


const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;


require('./models/Index')();
require('./models/People')();
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

// Serve static files
app.use(serve(path.join(__dirname, 'public')));

// Compress
app.use(compress());

if (!module.parent) {
  app.listen(7000);
  console.log('listening on port 7000');
}
