var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var app_env = require('./modules/set_env.js');
var app_config = require('./modules/config.js');
var login = require("./modules/login.js");
var session = require("./modules/session.js");
var cors = require('cors');

var app = express();

global.env = app_env.env;
global.db = app_config.initDB(env);
global.cache = app_config.initRedis(env);
global.isDevelopment = (env== "development");

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set up CORS options

var whitelist = ['http://localhost:3006', 'http://localhost:3000', 'chrome-extension://fdmmgilgnpjigdojojpjoooidkmcomcm'];
var corsOptions = {
  origin: function (origin, callback) {
      if ((whitelist.indexOf(origin) !== -1) || !origin){
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
};

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
    session.init(req, res, next);
});

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
