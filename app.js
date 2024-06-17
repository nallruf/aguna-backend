var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const fs = require('fs');
const cors = require("cors");

dotenv.config();

var indexRouter = require('./routes/index');
var publicApiRouter = require('./routes/publicApi');
var apiRouter = require('./routes/api');
var userRouter = require('./routes/users');
var adminRouter = require('./routes/admin');

var app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
); 

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/images', express.static(path.join(__dirname, 'public/images')));


const swaggerDocument = JSON.parse(fs.readFileSync(path.join(__dirname, 'docs.json'), 'utf8'));

const options = {
  definition: swaggerDocument,
  apis: ['./routes/*.js'], // Ganti dengan jalur ke file API Anda
};

const specs = swaggerJsdoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));


const v1Router = express.Router();
app.use('/api/v1', v1Router);

app.use('/', indexRouter);
v1Router.use('/public', publicApiRouter);
v1Router.use('/auth', apiRouter);
v1Router.use('/user', userRouter);
v1Router.use('/admin', adminRouter);


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

// const port = 3000;
// app.listen(port, '0.0.0.0', () => {
//   console.log(`Server is running on port ${port}`);
// });

module.exports = app;
