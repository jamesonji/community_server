var express = require('express');
var _ = require('../libs/underscore-min.js');
var util = require('../modules/util');
var async = require('async');
var local = require('./local');
var db = require('./db');
var user = require('./user.js');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var request = require('request');

const GOOGLE_CONSUMER_KEY = local.GOOGLE_CONSUMER_KEY;
const GOOGLE_CONSUMER_SECRET = local.GOOGLE_CONSUMER_SECRET;

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

login.local = function(username, password, next) {
    if(username && password){
        var searchObj = {username: username};
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
                    next(err);
                } else if (!foundUser || _.isEmpty(foundUser)) {
                    next(new Error("Incorrect username"));
                } else if (util.getPasswordHash(password) != foundUser.password) {
                    next(new Error("Incorrect password"));
                } else {
                    next(null, {id: foundUser.id});
                }
            });
    } else {
        next(new Error("username and password is needed"));
    }
};

login.google = new GoogleStrategy({
        clientID: GOOGLE_CONSUMER_KEY,
        clientSecret: GOOGLE_CONSUMER_SECRET,
        callbackURL: "/signin/google/done"
    },
    function(accessToken, refreshToken, profile, next) {
        console.log("accessToken", accessToken);
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

login.facebook = function(tokenObj, next) {
    var profile = {};
    async.waterfall([
            async.apply(facebookCheck, tokenObj),
            function (facebookUser, next) {
                facebookUser = util.parseJSON(facebookUser);
                if (facebookUser && !_.isEmpty(facebookUser)) {
                    profile = facebookUser;
                    console.log("profile", profile);
                    var searchObj = {username: "facebook-" + profile.id.toString()};
                    db.getIds("user", searchObj, next);
                } else {
                    next(new Error("login Error"));
                }
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
};

function facebookCheck(tokenObj, next){
    if(tokenObj && !_.isEmpty(tokenObj)){
        var fields = ["name", "id", "gender", "cover", "email", "relationship_status"];
        var qs = {access_token: tokenObj.access_token, fields: fields.join(',')};
        var options = {
            url: "https://graph.facebook.com/v2.10/" + tokenObj.userID,
            // url: "https://graph.facebook.com/me",
            qs: qs
        };
        request.get(options, function (err, response, body) {
            if (err){
                // console.log("err", err);
                next(err);
            }else{
                // console.log("body", body);
                next(null, body);
            }
        });
    } else {
        next(new Error("token object is needed"));
    }
}

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

module.exports = login;
