var express = require('express');
var router = express.Router();
var db = require('../modules/db.js');
var passport = require('passport');
var session = require('../modules/session.js');
var login = require('../modules/login.js');
var user = require('../modules/user.js');
var util = require('../modules/util.js');

/* GET home page. */
router.get('/test', function(req, res) {
    var tokenObj = {
        access_token: "EAABwLLGrjPoBANdXluGsowXCDU3OGOAy4tNY1juIfr83TbfYCXMQI9bgadpkVLeZBtkSYD9jL5Yp8P5WOY39PBtIftG636gi9bgQaYcfDf24MsM39oazRIX1UZCfARKCrMtrO4zcqgW8sWyovjSZBMrtM3uf6z42KJaA9QmeZBGzoXMYEv3KTNk0VWkQKkLnXmjPRm7ZCYwZDZD",
        userID: "10210770000710511"
    };
    login.facebook(tokenObj, function (err, result) {
        res.send(result);
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
            res.send(result);
        }
    });
});

router.get('/signin', function(req, res) {
    var local = require("../modules/local.js");
    res.render('signin', {facebook_app_id:local.facebook.id});
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

router.get('/signin/google', passport.authenticate("google", {scope: ['https://www.googleapis.com/auth/plus.login'] }));

router.get('/signin/google/done', passport.authenticate('google', {session: false, failureRedirect: '/signin' }), function(req, res) {
    session.setSession(req.user.id, res, function (err, autoObj) {
        if(err){
            res.status(500).json({error: err.message});
        } else {
            res.send(autoObj);
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

module.exports = router;
