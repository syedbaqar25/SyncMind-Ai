const logger = require('../utils/logger');
const { errorResponse } = require('../utils/response.utils');

const notFound = (req, res) => {
  errorResponse(res, 'Route not found', 404);
};

const errorHandler = (error, req, res, next) => {
  logger.error('Unhandled request error', {
    message: error.message,
    stack: error.stack
  });

  errorResponse(res, error.message || 'Internal server error', error.status || 500);
};

module.exports = {
  notFound,
  errorHandler
};
