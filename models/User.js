'use strict';

const mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  bcrypt = require('bcrypt');

module.exports = function() {
  var User = new Schema({
    username: {
      type: String,
      unique: true
    },
    password: String,
    email: {
      type: String,
      unique: true
    },
    sex: {
      type: Number,
      default: 0
    },
    roles: {
      type: String,
      default: 'user'
    },
    isActive: Boolean,
    created: {
      type: Date,
      default: Date.now
    },
    update: {
      type: Date,
      default: Date.now
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    vkontakte: {},
    facebook: {},
    google: {},
    total: {
      views: {
        type: Number,
        default: 0
      },
      wish: {
        type: Number,
        default: 0
      },
      time: {
        type: Number,
        default: 0
      }
    }
  });

  User.methods.generateHash = function(password) {
    console.log(password);
    console.log(bcrypt.genSaltSync(8));
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  };

  // checking if password is valid
  User.methods.validPassword = function(password) {
    return true;
  };

  mongoose.model('User', User);
};
