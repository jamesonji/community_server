var express = require('express');
var redis = require('redis');
var _ = require('../libs/underscore-min.js');
var UAParser = require('ua-parser-js');
var parser = new UAParser();
var crypto = require("crypto");
var async = require("async");
var local = require('./local.js');

var util = {};

util.getTS = function (datetime) {
    var intDateTime = new Date().getTime();
    if (datetime) {
        intDateTime = new Date().getTime(datetime);
    }
    return parseInt(intDateTime / 1000, 10);
};

util.getToken = function (openId, session_key) {
    var secret = openId + '_' + session_key;
    var sha = crypto.createHash("sha256");
    return sha.update(secret).digest("hex");
};

util.getUserId = function (openId) {
    var secret = openId + "_" + local.wx.secret;
    var md5 = crypto.createHash("md5");
    return md5.update(secret).digest("hex");
};

util.checkDate = function(ts){
    var now = util.getTS();
    var dateDiff = now - ts;
    return (dateDiff < 86400);
};

util.getBrowserInfo = function(req) {
    var ua = req.headers['user-agent'];
    return browser = parser.setUA(ua).getBrowser();
};

util.getOSInfo = function(req) {
    var ua = req.headers['user-agent'];
    return OS = parser.setUA(ua).getOS();
};

util.isMobile = function(req){
    var deviceType = req.device.type;
    return (deviceType == 'mobile');
};

util.isIOS = function(req) {
    var ua = req.headers['user-agent'];
    var OS = parser.setUA(ua).getOS().name;
    return (OS == 'iOS');
};

util.nocache = function nocache(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
};

util.parseJSON = function (str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        console.log("util parserJSON", e.message);
        return {};
    }
};

module.exports = util;
