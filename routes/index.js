var express = require('express');
var router = express.Router();
var db = require('../modules/db.js');

/* GET home page. */
router.get('/test', function(req, res) {
  var model_name = "dishes";
  var where_conditions = {category: "B"};
  db.getIds(model_name, where_conditions, function (err, reply) {
    res.send(reply);
  });
});

router.get('/', function(req, res) {
  res.render('index', { title: 'Menucraft' });
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

module.exports = router;
