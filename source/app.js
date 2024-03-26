const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const logger = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();

const database = require('./configs/database')
const { hbsEngine } = require('./configs/handlebars')
const { commonLimiter } = require('./configs/ratelimit')
const indexRouter = require('./routes/index');

const app = express();

// database setup
switch (app.get('env')) {
  case 'development':
    mongoose.connect(database.development.connectionString).then(() => console.log('Connected Development DB!'));
    break;
  case 'production':
    mongoose.connect(database.production.connectionString).then(() => console.log('Connected Production DB!'));
    break;
  default:
    throw new Error('Unknown execution environment ' + app.get('env'));
}

// view engine setup
app.engine('handlebars', hbsEngine);
app.set('view engine', 'handlebars');

// common setup
app.use(commonLimiter);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ secret: process.env.SESSION_KEY, resave: false, saveUninitialized: true }));
app.use(express.static(path.join(__dirname, 'public')));

if (app.get('env') === 'production') {
  app.use(async (req, res, next) => {
    res.locals.production = true;
    next();
  })
}
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) { next(createError(404)); });

// error handler
app.use(function (err, req, res, next) {
  console.log(err.message)

  const getError = (status) => {
    switch (status) {
      case 401:
        return { status: 'Error 401', title: 'Unauthorized', message: 'Your login session has expired. You are not allowed to access this resource.' };
      case 429:
        return { status: 'Error 429', title: 'Sorry', message: 'Too many requests from this IP, please try again later.' };
      default:
        return { status: 'Error 404', title: 'Erm. Page not found', message: 'The requested resource could not be found.' };
    }
  }

  res.status(err.status || 500);
  if (err.status === 401 || err.status === 429 || err.status === 404) {
    const error = getError(err.status);
    res.render('error', { layout: null, error: error });
  } else {
    res.render('500', { layout: null });
  }
});

module.exports = app;