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
  res.render('index', { title: 'Hello' });
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

router.get('/signin', function(req, res) {
  res.render('signin');
});

router.get('/signup', function(req, res) {
    res.render('signup');
});

router.post('/signup', function(req, res) {
    user.add(req, function(err, result){
       if(err){
           res.status(500).json({error: err.message});
       } else {
           res.send(result);
       }
    });
});

router.post('/signin', passport.authenticate("local", {session: false}), function(req, res) {
    console.log("req.user", req.user);
    session.setSession(req.user.id, res, function () {
        req.session.user = req.user;
        res.redirect("/");
    });
});

router.get('/signin/google', passport.authenticate("google", {scope: ['https://www.googleapis.com/auth/plus.login'] }), function(req, res) {
    console.log("req.user", req.user);
    // session.setSession(req.user.id, res, function () {
    //     req.session.user = req.user;
    // });
        res.send("you're in by Google");
});

router.get('/signin/done', passport.authenticate('google', { failureRedirect: '/signin' }), function(req, res) {
    console.log("ok");
    res.redirect("/");
});


module.exports = router;
