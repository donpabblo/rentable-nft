var express = require('express');
var path = require('path');
var logger = require('morgan');
const bodyParser = require('body-parser');

var confRouter = require('./routes/conf');
var assetRouter = require('./routes/asset');
var counterRouter = require('./routes/counter');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/conf', confRouter);
app.use('/asset', assetRouter);
app.use('/counter', counterRouter);

module.exports = app;
