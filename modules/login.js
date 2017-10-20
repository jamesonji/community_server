var express = require('express');
var _ = require('../libs/underscore-min.js');
var util = require('../modules/util');
var async = require('async');
var local = require('./local');
var db = require('./db');
var user = require('./user.js');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

const GOOGLE_CONSUMER_KEY = local.GOOGLE_CONSUMER_KEY;
const GOOGLE_CONSUMER_SECRET = local.GOOGLE_CONSUMER_SECRET;
const FACEBOOK_APP_ID = local.facebook.id;
const FACEBOOK_APP_SECRET = local.facebook.secret;

var login = {};

login.checkAuth = function loggedIn(req, res, next) {
    var cache = global.cache;
    if(req.headers.authObj){
        var cache_key = req.headers.authObj.hash;
        var uid = req.headers.authObj.uid;
        if(cache_key){
            cache.get(cache_key, function (err, result) {
                if(result == uid) {
                    if (req.session) {
                        req.session.user = {id: uid};
                        next();
                    }else {
                        next();
                    }
                }else{
                    next();
                }
            });
        }else{
            next();
        }
    } else {
        res.status(401).json({error: "please signin in first"});
    }
};

login.local = new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
    },
    function(username, password, next) {
        var searchObj = {username: username};
        async.waterfall([
                function (next) {
                    db.getIds("user", searchObj, next);
                },
                function (ids, next) {
                    if(ids && ids.length) {
                        db.getValue("user", ids[0], next);
                    } else {
                        next();
                    }
                }],
            function (err, foundUser) {
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
    }
);

login.google = new GoogleStrategy({
        clientID: GOOGLE_CONSUMER_KEY,
        clientSecret: GOOGLE_CONSUMER_SECRET,
        callbackURL: "/signin/google/done"
    },
    function(accessToken, refreshToken, profile, next) {
        var searchObj = {username: "google-" + profile.id.toString()};
        async.waterfall([
                function (next) {
                    db.getIds("user", searchObj, next);
                },
                function (ids, next) {
                    if (ids && ids.length) {
                        db.getValue("user", ids[0], next);
                    } else {
                        next();
                    }
                }],
            function (err, foundUser) {
                if (err) {
                    next(false, err);
                } else if (!foundUser || _.isEmpty(foundUser)) {
                    user.addGoogle(profile, function (err, result) {
                        next(err, {id: result.insertId});
                    });
                } else {
                    next(null, {id: foundUser.id});
                }
            });
    }
);

login.facebook = new FacebookStrategy({
        clientID: FACEBOOK_APP_ID,
        clientSecret: FACEBOOK_APP_SECRET,
        callbackURL: "/signin/facebook/done"
    },
    function(accessToken, refreshToken, profile, next) {
        var searchObj = {username: "facebook-" + profile.id.toString()};
        async.waterfall([
                function (next) {
                    db.getIds("user", searchObj, next);
                },
                function (ids, next) {
                    if (ids && ids.length) {
                        db.getValue("user", ids[0], next);
                    } else {
                        next();
                    }
                }],
            function (err, foundUser) {
                if (err) {
                    next(false, err);
                } else if (!foundUser || _.isEmpty(foundUser)) {
                    user.addFacebook(profile, function (err, result) {
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
