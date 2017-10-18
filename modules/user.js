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

function getUserObj(req) {
    var userObj = {};
    userObj.username = req.body.username;
    userObj.password = util.getPasswordHash(req.body.password);
    userObj.email = req.body.email;
    return userObj;
}

module.exports = user;
