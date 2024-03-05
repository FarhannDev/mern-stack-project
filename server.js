require('dotenv').config();

// Build Your Application use Express
const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const { logger, logEvents } = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const corsOptions = require('./config/corsOptions');
const connectDB = require('./config/database');

// console.log(process.env.NODE_ENV);

connectDB();

// use express middleware
app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Use Static Files express
app.use('/', express.static(path.join(__dirname, 'public')));

// Use Routing
app.use('/', require('./routes/root'));

// Handle Routing 404 (Not Found)
app.all('*', (req, res) => {
  res.status(404);
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'views', '404.html'));
  } else if (req.accepts('json')) {
    res.json({ message: '404 Not Found' });
  } else {
    res.type('txt').send('404 Not Found');
  }
});

// use express error handler middleware
app.use(errorHandler);

// Running your application
mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT} `)
  );
});

mongoose.connection.on('error', (err) => {
  console.log(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    'mongoErrLog.log'
  );
});
