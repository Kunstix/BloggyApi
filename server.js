const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookierParser = require('cookie-Parser');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const blogRoutes = require('./routes/blogRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// DATABASE
mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Database connected successfully...'))
  .catch(err => console.log(err));

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

// SERVER
const port = process.env.PORT || 3333;
app.listen(port, () => {
  console.log(`Bloggy Server is listening on port ${port}...`);
});
