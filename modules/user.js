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
    if(profile && profile.sub) {
        var pool = global.db;
        var strsql = "INSERT INTO `user` SET ?";
        var userObj = getGoogleUserObj(profile);
        db.sqlExec(pool, strsql, userObj, next);
    } else {
        next(new Error("user info from google is empty"));
    }
};

user.addFacebook = function (profile, next) {
    if(profile && profile.id) {
        var pool = global.db;
        var strsql = "INSERT INTO `user` SET ?";
        var userObj = getFacebookUserObj(profile);
        db.sqlExec(pool, strsql, userObj, next);
    } else {
        next(new Error("user info from facebook be empty"));
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
    var userObj = {};
    userObj.passports = JSON.stringify(profile);
    userObj.username = "google-" + profile.sub.toString();
    userObj.password = null;
    userObj.gender = profile.gender;
    userObj.avatar = profile.picture;
    userObj.relationshipStatus = profile.relationshipStatus;
    return userObj;
}

function getFacebookUserObj(profile) {
    var userObj = {};
    userObj.passports = JSON.stringify(profile);
    userObj.username = "facebook-" + profile.id.toString();
    userObj.password = null;
    userObj.gender = profile.gender;
    userObj.relationshipStatus = profile.relationship_status;
    return userObj;
}

module.exports = user;
