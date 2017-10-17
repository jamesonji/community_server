var express = require('express');
var mysql = require('mysql');
var redis = require('redis');
var local = require('./local.js');
var _ = require('../libs/underscore-min.js');

var app_config = {};

app_config.initDB = function(env){
    var host = '';
    var database = '';
    var user = '';
    var password = '';
    var timezone = 'UTC';
    var charset = 'utf8mb4';

    switch(env) {
        case 'development':
            host = 'menucraftdb.czrygyr8r5mz.us-west-2.rds.amazonaws.com';
            database = 'cheers';
            user = local.mysql.user;
            password = local.mysql.password;
            charset = 'utf8mb4';
            break;
        case 'production':
            host = 'menucraftdb.czrygyr8r5mz.us-west-2.rds.amazonaws.com';
            database = 'cheers';
            user = local.mysql.user;
            password = local.mysql.password;
            charset = 'utf8mb4';
            break;
        default:
    }
    var options = {host: host, database: database, user: user, password: password, timezone: timezone, charset: charset, multipleStatements: false};
    return mysql.createPool(options);
};

app_config.initRedis = function (env) {
    var redisObj = {};
    switch(env) {
        case 'development':
            redisObj.host = '35.167.64.202';
            redisObj.port = '6379';
            redisObj.password = local.redis.password;
            break;
        case 'production':
            redisObj.host = '172.31.37.21';
            redisObj.port = '6379';
            redisObj.password = local.redis.password;
            break;
        default:
    }
    return redis.createClient(redisObj);
};

module.exports = app_config;
