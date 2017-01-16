const passport = require('koa-passport'),
  mongoose = require('mongoose'),
  User = mongoose.model('User');

User.findOne({
  username: 'test'
}, function(err, testUser) {
  'use strict';
  if (!testUser) {
    console.log('test user did not exist; creating test user...');
    testUser = new User({
      username: 'test',
      password: 'test'
    });
    testUser.save();
  }
});

passport.serializeUser(function(user, done) {
  'use strict';
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  'use strict';
  User.findById(id, function(err,user){
    console.log(err);
    console.log(user);
    if (err) {
      return done(err);
    } else {
      done(null,user);
      console.log(user);
    }
  });
});

const BasicStrategy = require('passport-http').BasicStrategy;
passport.use(new BasicStrategy(function(username, password, done) {
  'use strict';
  User.findOne({
    username: username
  }, function(err, user) {
    if (err) {
      return done(err);
    }
    if (user === null) {
      return done(null, false);
    }
    if (!user.validPassword(password)) {
      return done(null, false);
    }
    return done(null, user);
  });
}));
