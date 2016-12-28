'use strict';

const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

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

  mongoose.model('User', User);
};
