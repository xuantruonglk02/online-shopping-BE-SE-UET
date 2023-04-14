const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const winston = require('winston');
const expressWinston = require('express-winston');
const session = require('express-session');

// load .env
require('dotenv').config();

// connect database
require('./models/database');

// connect services
require('./services/elastichsearch.service');
const { redisStore } = require('./services/redis.service');

// routers
const router = require('./routes/index');

const app = express();

app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
    session({
        store: redisStore,
        secret: process.env.REDIS_SESSION_SECRET_KEY,
        saveUninitialized: true,
        cookie: {
            secure: false,
            httpOnly: true,
            maxAge: parseInt(process.env.REDIS_SESSION_EXPIRE) || 86400,
        },
        resave: false,
    }),
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

// request logging
app.use(
    expressWinston.logger({
        transports: [
            new winston.transports.File({
                filename: path.join(__dirname, '../log/request.log'),
            }),
        ],
        format: winston.format.combine(winston.format.colorize(), winston.format.json()),
        meta: true, // optional: control whether you want to log the meta data about the request (default to true)
        msg: 'HTTP {{req.method}} {{req.url}}', // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
        expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
        colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
        ignoreRoute: function (req, res) {
            return false;
        }, // optional: allows to skip some log messages based on request and/or response
    }),
);

// routing
app.use('/', router);

// error logging
app.use(
    expressWinston.errorLogger({
        transports: [
            new winston.transports.File({
                filename: path.join(__dirname, '../log/error.log'),
                level: 'error',
            }),
        ],
        format: winston.format.combine(winston.format.colorize(), winston.format.json()),
    }),
);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    console.log(err);
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
