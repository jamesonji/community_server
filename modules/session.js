var express = require('express');
var crypto = require('crypto');
var _ = require('../libs/underscore-min.js');
var util = require('./util.js');

var session = {};
var cookie_options = {maxAge: 1000*60*60*24*30};
var cookie_name = "Neighbor-cheers-session";

session.init = function sessionInit(req, res, next) {
    if(!req.session){
        req.session = {};
    }
    session.getSession(req, next);
};

session.getSession = function getSession(req, next) {
    var cache = global.cache;
    var cache_key = getCookie(req).hash;
    var uid = getCookie(req).uid;

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
};

session.setSession = function setSession(uid, res, next) {
    var cache = global.cache;
    var cache_key = setCookie(uid, res);
    // console.log("cache_key", cache_key);
    cache.set(cache_key, uid, function (err) {
        if (!err)
            cache.expire(cache_key, cookie_options.maxAge);
        if (typeof next != "undefined")
            next(null, {uid: uid, hash: cache_key});
    });
};

session.destroy = function getSession(req, res, next) {
    var cache = global.cache;
    var cache_key = getCookie(req).hash;
    res.clearCookie(cookie_name);
    cache.del(cache_key, function (err) {
        delete req.session;
        if (typeof next != "undefined")
            next(err);
    });
};

function getCookie(req) {
    if (req.cookies) {
        // console.log("cookies", req.cookies);
        if (req.cookies[cookie_name]) {
            try {
                return JSON.parse(req.cookies[cookie_name]);
            } catch (err) {
                return {};
            }
        } else {
            return {};
        }
    } else {
        return {};
    }
}

function setCookie(uid, res) {
    var cookie_hash = crypto.randomBytes(32).toString('hex');
    var cookie_value =JSON.stringify({uid: uid, hash: cookie_hash});
    res.cookie(cookie_name, cookie_value, cookie_options);
    return cookie_hash;
}

module.exports = session;