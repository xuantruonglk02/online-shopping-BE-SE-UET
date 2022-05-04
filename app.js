const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const dotenv = require('dotenv').config();

// routers
const indexRouter = require('./routes/index.router');
const authRouter = require('./routes/auth.router');
const userRouter = require('./routes/user.router');
const cartRouter = require('./routes/cart.router');
const productRouter = require('./routes/product.router');
const checkoutRouter = require('./routes/checkout.router');
const adminRouter = require('./routes/admin.router');

const app = express();

app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

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
app.use('/checkout', checkoutRouter);
app.use('/admin', adminRouter);

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
