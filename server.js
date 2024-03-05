// Build Your Application use Express
const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;

const { logger } = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');

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
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT} `)
);
