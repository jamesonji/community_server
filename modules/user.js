var express = require('express');
var _ = require('../libs/underscore-min.js');
var util = require('../modules/util');
var db = require('./db');

var user = {};

user.add = function (req, next) {
    if(req.body.password && req.body.username) {
        var pool = global.db;
        var strsql = "INSERT INTO `user` SET ?";
        var userObj = getUserObj(req);
        db.sqlExec(pool, strsql, userObj, next);
    } else {
        next(new Error("username and password cannot be empty"));
    }
};

user.addGoogle = function (profile, next) {
    if(profile && profile.id) {
        var pool = global.db;
        var strsql = "INSERT INTO `user` SET ?";
        var userObj = getGoogleUserObj(profile);
        db.sqlExec(pool, strsql, userObj, next);
    } else {
        next(new Error("can't retrieve user info from google be empty"));
    }
};

function getUserObj(req) {
    var userObj = {};
    userObj.username = req.body.username;
    userObj.password = util.getPasswordHash(req.body.password);
    userObj.email = req.body.email;
    return userObj;
}

function getGoogleUserObj(profile) {
    var id = profile.id;
    var userObj = {};
    userObj.passports = JSON.stringify({google: {id: id, type: "google", displayName: profile.displayName}});
    userObj.username = profile.displayName + " Google-" + id.toString();
    userObj.password = null;
    userObj.gender = profile.gender;
    userObj.avatar = profile._json? (profile._json.image? profile._json.image.url: null) : null;
    userObj.relationshipStatus = profile._json? profile._json.relationshipStatus : null;
    return userObj;
}

module.exports = user;
