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

var user = { id: 1, username: 'test', password: 'test' };


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    done(null, user);
});

const LocalStrategy = require('passport-local').Strategy
passport.use(new LocalStrategy(function(username, password, done) {
      if (username === user.username && password === user.password) {
        done(null, user);
      } else {
        done(null, false);
      }
}));


passport.use('local-signup', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField: 'email',
    passwordField: 'password'
  },
  function(req, email, password, done) {
    'use strict';


    // find a user whose email is the same as the forms email
    // we are checking to see if the user trying to login already exists
    User.findOne({
      'email': email
    }, function(err, user) {
      // if there are any errors, return the error
      if (err)
        return done(err);

      // check to see if theres already a user with that email
      if (user) {
        req.body = {'signupMessage': 'That email is already taken.'};
        return done(null, false);
      } else {

        // if there is no user with that email
        // create the user
        var newUser = new User();

        // set the user's local credentials
        newUser.email = email;
        newUser.password = newUser.generateHash(password);

        // save the user
        newUser.save(function(err) {
          if (err)
            throw err;
          return done(null, newUser);
        });
      }
    });
  })
);
