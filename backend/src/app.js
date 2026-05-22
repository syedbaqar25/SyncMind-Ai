const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');
const { errorResponse } = require('./utils/response.utils');
const logger = require('./utils/logger');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.use('/api', routes);

app.use((req, res) => {
  errorResponse(res, 'Route not found', 404);
});

app.use((error, req, res, next) => {
  logger.error('Unhandled request error', {
    message: error.message,
    stack: error.stack
  });

  errorResponse(res, error.message || 'Internal server error', error.status || 500);
});

module.exports = app;
