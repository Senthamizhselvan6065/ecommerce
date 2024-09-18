const express = require('express');
const app = express();

app.use(express.json());
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const products = require('./routes/product');
app.use('/api/v1', products);
const auth = require('./routes/auth');
app.use('/api/v1', auth);

const errorMiddleware = require('./middlewares/error');
app.use(errorMiddleware);

module.exports = app;