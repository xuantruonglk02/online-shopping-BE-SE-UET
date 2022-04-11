const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
// const dotenv = require('dotenv').config();
const dotenv = require('dotenv').config({ path: '.env.localhost' });

// routers
const indexRouter = require('./routes/index.router');
const authRouter = require('./routes/auth.router');
const userRouter = require('./routes/user.router');
const cartRouter = require('./routes/cart.router');
const productRouter = require('./routes/product.router');

const app = express();

app.set('trust proxy', 1);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// app.use(function(req, res, next) {

//   // Website you wish to allow to connect
//   res.setHeader('Access-Control-Allow-Origin', '*');

//   // Request methods you wish to allow
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

//   // Request headers you wish to allow
//   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,authorization');

//   // Set to true if you need the website to include cookies in the requests sent
//   // to the API (e.g. in case you use sessions)
//   res.setHeader('Access-Control-Allow-Credentials', true);

//   // Pass to next layer of middleware
//   next();
// });

// app.use((req, res, next) => {
//   if (!req.session.returnTo) {
//     req.session.returnTo = '/';
//   } else if (req.method === 'GET'
//     && !req.originalUrl.match(/\/auth\//)
//     && !req.originalUrl.match(/\/css\//)
//     && !req.originalUrl.match(/\/js\//)
//     && !req.originalUrl.match(/(\.ico)$|(\.ico\/)$/)) {
//     req.session.returnTo = req.originalUrl;
//   }
//   next();
// });

// routing
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/cart', cartRouter);
app.use('/product', productRouter);

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
  // res.render('error');
  res.end('error');
});

module.exports = app;