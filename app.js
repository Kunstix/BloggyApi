const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookierParser = require('cookie-Parser');
const cors = require('cors');
const blogRoutes = require('./routes/blogRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const globalErrorHandler = require('./controllers/errorController');

const app = express();
// MIDDLEWARES
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cookierParser());
if (process.env.NODE_ENV === 'development') {
  app.use(cors({ origin: `${process.env.CLIENT_URL}` }));
}

// ROUTES
app.use('/api', blogRoutes);
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', categoryRoutes);

// Global Errorhandling
app.use(globalErrorHandler);

module.exports = app;
