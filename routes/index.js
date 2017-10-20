var express = require('express');
var router = express.Router();
var db = require('../modules/db.js');
var passport = require('passport');
var session = require('../modules/session.js');
var login = require('../modules/login.js');
var user = require('../modules/user.js');

/* GET home page. */
router.get('/test', function(req, res) {
  var model_name = "dishes";
  var where_conditions = {category: "B"};
  db.getIds(model_name, where_conditions, function (err, reply) {
    res.send(reply);
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

router.get('/signin', function(req, res) {
    res.render('signin');
});

router.post('/signin', passport.authenticate("local", {session: false}), function(req, res) {
    session.setSession(req.user.id, res, function (err, autoObj) {
        if(err){
            res.status(500).json({error: err.message});
        } else {
            res.send(autoObj);
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

router.get('/signin/facebook', passport.authenticate('facebook'));

router.get('/signin/facebook/done', passport.authenticate('facebook', {session: false, failureRedirect: '/signin' }), function(req, res) {
    console.log("cp2", req.user);
    session.setSession(req.user.id, res, function (err, autoObj) {
        if(err){
            res.status(500).json({error: err.message});
        } else {
            res.send(autoObj);
        }
    });
});

module.exports = router;
