const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
// const dotenv = require('dotenv').config();
const dotenv = require('dotenv').config({ path: '.env.localhost' });

// routers
const indexRouter = require('./routes/index.router');
const authenticationRouter = require('./routes/authentication.router');

const app = express();

// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.set('trust proxy', 1);
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false
  }
}));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  if (!req.session.returnTo) {
    req.session.returnTo = '/';
  } else if (req.method === 'GET'
    && !req.originalUrl.match(/\/auth\//)
    && !req.originalUrl.match(/\/css\//)
    && !req.originalUrl.match(/\/js\//)
    && !req.originalUrl.match(/(\.ico)$|(\.ico\/)$/)) {
    req.session.returnTo = req.originalUrl;
  }
  next();
});

// routing
app.use('/', indexRouter);
app.use('/auth', authenticationRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
