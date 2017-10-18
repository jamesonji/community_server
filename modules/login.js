var express = require('express');
var _ = require('../libs/underscore-min.js');
var util = require('../modules/util');
var local = require('./local');
var db = require('./db');
var user = require('./user.js');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const GOOGLE_CONSUMER_KEY = local.GOOGLE_CONSUMER_KEY;
const GOOGLE_CONSUMER_SECRET = local.GOOGLE_CONSUMER_SECRET;

var login = {};

login.checkAuth = function loggedIn(req, res, next) {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/signin');
    }
};

login.localLogin = new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
    },
    function(username, password, next){
    db.getValue("user", "username", username, function (err, foundUser) {
        if (err) {
            next(false, err);
        } else if (!foundUser || _.isEmpty(foundUser)) {
            next(null, false, new Error("Incorrect username"));
        } else if (util.getPasswordHash(password) != foundUser.password) {
            next(null, false, new Error("Incorrect password"));
        } else {
            next(null, {id: foundUser.id});
        }
    });
});

login.localGoogle = new GoogleStrategy({
        clientID: GOOGLE_CONSUMER_KEY,
        clientSecret: GOOGLE_CONSUMER_SECRET,
        callbackURL: "/signin/google/done"
    },
    function(accessToken, refreshToken, profile, next) {
        db.getValue("user", "google_id", profile.id, function (err, foundUser) {
            if (err) {
                next(false, err);
            } else if (!foundUser || _.isEmpty(foundUser)) {
                user.addGoogle(profile, function(err, result) {
                    next(err, {id: result.insertId});
                });
            } else {
                next(null, {id: foundUser.id});
            }
        });
    }
);

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

module.exports = login;
