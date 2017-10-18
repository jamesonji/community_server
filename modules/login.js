var express = require('express');
var _ = require('../libs/underscore-min.js');
var util = require('../modules/util');
var local = require('./local');
var db = require('./db');
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
    db.getValue("user", "username", username, function (err, user) {
        if (err) {
            next(false, err);
        } else if (!user || _.isEmpty(user)) {
            next(null, false, new Error("Incorrect username"));
        } else if (util.getPasswordHash(password) != user.password) {
            next(null, false, new Error("Incorrect password"));
        } else {
            next(null, {id: user.id});
        }
    });
});

login.localGoogle = new GoogleStrategy({
        clientID: GOOGLE_CONSUMER_KEY,
        clientSecret: GOOGLE_CONSUMER_SECRET,
        callbackURL: "/signin/done"
    },
    function(accessToken, refreshToken, profile, next) {
        console.log("cp1", GOOGLE_CONSUMER_KEY);
        console.log("cp2", GOOGLE_CONSUMER_SECRET);
        console.log("accessToken", accessToken);
        console.log("refreshToken", refreshToken);
        console.log("profile", profile);
        next(null, profile);
    }
);

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

module.exports = login;
