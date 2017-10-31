var express = require('express');
var _ = require('../libs/underscore-min.js');

var db = {};

db.getValue = function (model_name, fieldValue, next)
{
    var pool = global.db;
    var cache = global.cache;
    if(typeof fieldValue == "string"){
        fieldValue = fieldValue.toLowerCase();
    }
    var cache_key = 'model_' + model_name + '_id' + '_' + fieldValue;
    var strsql = 'SELECT * FROM ' + model_name + ' WHERE id=' + pool.escape(fieldValue) + ' AND deleted_at is NULL';
    cache.get(cache_key, function (err, reply) {
        if (reply) {
            next(null, JSON.parse(reply));
        } else if (err) {
            next(err);
        } else {
            db.sqlExec(pool, strsql, null, function (err, records) {
                if(err){
                    next(err);
                }else{
                    var string = '{}';
                    if (records.length > 0) {
                        string = JSON.stringify(records[0]);
                        cache.set(cache_key, string, function (err, reply) {
                            if (reply) {
                                cache.expire(cache_key, 86400);
                                next(null, JSON.parse(string));
                            } else {
                                next(err);
                            }
                        });
                    } else {
                        next(err);
                    }
                }
            });
        }
    });
};

db.getIds = function (model_name, where_conditions, next) {
    var pool = global.db;
    var strsql = "SELECT id FROM " + model_name + " WHERE deleted_at is null AND ?";
    db.sqlExec(pool, strsql, where_conditions, function (err, records) {
        if (err) {
            next(err);
        } else {
            var ids = _.pluck(records, "id");
            next(null, ids);
        }
    });
};

db.sqlExec = function (pool, strsql, sqlObj, next){
    pool.getConnection(function (err, connection) {
        if (err){
            next(err);
        }else {
            connection.query(strsql, sqlObj, function (err, records) {
                next(err, records);
            });
            connection.release();
        }
    });
};

module.exports = db;
