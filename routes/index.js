var express = require('express');
var router = express.Router();
var db = require('../modules/db.js');
var session = require('../modules/session.js');
var login = require('../modules/login.js');
var user = require('../modules/user.js');
var util = require('../modules/util.js');

/* GET home page. */
router.use(function(req, res, next){
    req.headers.authObj = req.headers.authObj || req.headers.authobj;
    next();
});

router.get('/test', function(req, res) {
    // var tokenObj = {
    //     access_token: "EAABwLLGrjPoBANdXluGsowXCDU3OGOAy4tNY1juIfr83TbfYCXMQI9bgadpkVLeZBtkSYD9jL5Yp8P5WOY39PBtIftG636gi9bgQaYcfDf24MsM39oazRIX1UZCfARKCrMtrO4zcqgW8sWyovjSZBMrtM3uf6z42KJaA9QmeZBGzoXMYEv3KTNk0VWkQKkLnXmjPRm7ZCYwZDZD",
    //     userID: "10210770000710511"
    // };
    // login.facebook(tokenObj, function (err, result) {
    //     res.send(result);
    // });

    var id_token = "eyJhbGciOiJSUzI1NiIsImtpZCI6ImIzYjkxNzdiYzg5NDY2YmFhY2Y1N2QxYzA2ZTFkMjY1Zjc3ZDVhYzEifQ.eyJhenAiOiI2MDMyNTk2NTQ1ODAtaTkycTRvOGo4ZHNlYjNpaGMyMTkxNm5jaG1qdTE2NW8uYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI2MDMyNTk2NTQ1ODAtaTkycTRvOGo4ZHNlYjNpaGMyMTkxNm5jaG1qdTE2NW8uYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTE5NzAzMzE5NjQwNzI5Nzg5MTEiLCJlbWFpbCI6ImFsYW4ubW9sdW5AZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiIyRVpSLUMwSTE5SEVuYXl6UjJ0SUVRIiwiaXNzIjoiYWNjb3VudHMuZ29vZ2xlLmNvbSIsImp0aSI6IjZhNzRmYjhiODM4MjdjMjFiZWIzOTUyNTMwYjRhNmIyODQ0NGMzMWQiLCJpYXQiOjE1MDk0MDk1MjMsImV4cCI6MTUwOTQxMzEyMywibmFtZSI6ImFsYW4gbW8iLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDUuZ29vZ2xldXNlcmNvbnRlbnQuY29tLy12TEpzUzAtMlhmSS9BQUFBQUFBQUFBSS9BQUFBQUFBQUFWMC9hUXpnckVqSUxuSS9zOTYtYy9waG90by5qcGciLCJnaXZlbl9uYW1lIjoiYWxhbiIsImZhbWlseV9uYW1lIjoibW8iLCJsb2NhbGUiOiJlbi1DQSJ9.XiN8cb-RyzB7zLrJZf8tVVcD2pmRDUgMlNiFH2HvDb2bjrvZrre8wGRNvH3HEHwf_uAf3TWJdR6Vd4F3OChzOcMB4D17mQDhBOckeDbi94illRp7RgY6D5YYWtXLlmOOqA6ChEqa9452moBNAAWk5cHFTY7oIY1YVqKZNXx7rs2vC3kTgC6I8lBBZMm6OIXbiy9_N-Kar4HzCVK4wB-T3WaNotMO2E0Fx16KV5kAdtKjCjcxAZ-wbNWvA017eJS9oTRVqPPw5bMMtVwn0pJdPP6ZcF5RdgEmeBhUhPK8rKW5eQfxASMwaFan6b35U9uBqpmHW0P-0XTEpj6g4JhQ6Q";
    login.google(id_token, function (err, result) {
        if (err) {
            res.status(500).json({error: err.message});
        } else {
            res.send(result);
        }
    });
});

router.get('/', login.checkAuth, function(req, res) {
    var sign_type = "Hello";
    res.render('index', {title: 'Hello', sign_type: sign_type});
});

router.post('/', login.checkAuth, function(req, res) {
    var sign_type = "Hello";
    res.render('index', {title: 'Hello', sign_type: sign_type});
});

router.get('/get', function(req,res) {
  var key = req.query.key;
  var cache = global.cache;
  cache.get(key, function (err, reply) {
    if(reply){
      res.send(reply);
    }else {
      res.send(err);
    }
  });
});

router.get('/clear', function(req,res) {
  var key = req.query.key;
  var cache = global.cache;
  cache.del(key, function () {
    res.send('OK');
  });
});

router.get('/signout', function(req, res){
    req.logout();
    session.destroy(req, res);
    res.send("you're out");
});

router.get('/signup', function(req, res) {
    res.render('signup');
});

router.post('/signup', function(req, res) {
    user.add(req, function(err, result){
       if(err){
           res.status(500).json({error: err.message});
       } else if (result && result.insertId){
           session.setSession(result.insertId, res, function (err, autoObj) {
               if(err){
                   res.status(500).json({error: err.message});
               } else {
                   res.send(autoObj);
               }
           });
       } else {
           res.status(500).json({error: "server error unknown"});
       }
    });
});

router.get('/me', login.checkAuth, function(req, res) {
    var uid = util.parseJSON(req.headers.authObj).uid;
    db.getValue("user", uid, function(err, result){
        if(err) {
            res.status(500).json({error: err.message});
        } else {
            if(result && result.passports){
                result.passports = util.parseJSON(result.passports);
            }
            res.send(result);
        }
    });
});

router.get('/signin', function(req, res) {
    var local = require("../modules/local.js");
    res.render('signin', {facebook_app_id:local.facebook.id, google_client_id: local.google.id});
});

router.post('/signin', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    login.local(username, password, function (err, result) {
        if(err) {
            res.status(500).json({error: err.message});
        } else if(result && result.id) {
            session.setSession(result.id, res, function (err, autoObj) {
                if(err){
                    res.status(500).json({error: err.message});
                } else {
                    res.send(autoObj);
                }
            });
        } else {
            res.status(500).json({error: "Error Unknown"});
        }
    });
});

router.post('/signin/facebook', function(req, res){
    var tokenObj = req.body.authObj;
    login.facebook(tokenObj, function (err, result) {
        if(err) {
            res.status(500).json({error: err.message});
        } else if(result && result.id) {
            session.setSession(result.id, res, function (err, autoObj) {
                if(err){
                    res.status(500).json({error: err.message});
                } else {
                    res.send(autoObj);
                }
            });
        } else {
            res.status(500).json({error: "Error Unknown"});
        }
    });
});

router.post('/signin/google', function(req, res){
    var authObj = req.body.authObj;
    login.google(authObj, function (err, result) {
        if(err) {
            res.status(500).json({error: err.message});
        } else if(result && result.id) {
            session.setSession(result.id, res, function (err, autoObj) {
                if(err){
                    res.status(500).json({error: err.message});
                } else {
                    res.send(autoObj);
                }
            });
        } else {
            res.status(500).json({error: "Error Unknown"});
        }
    });
});

module.exports = router;
