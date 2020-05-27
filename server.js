const mongoose = require('mongoose');
require('dotenv').config();

const app = require('./app');

// DATABASE
mongoose
  .connect(
    process.env.NODE_ENV === 'development'
      ? process.env.DATABASE_LOCAL
      : process.env.DATABASE_CLOUD,
    {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  )
  .then(() => console.log('Database connected successfully...'))
  .catch(err => console.log(err));

// SERVER
const port = process.env.PORT || 3333;
app.listen(port, () => {
  console.log(`Bloggy Server is listening on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated!');
  });
});
