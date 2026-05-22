const { ZodError } = require('zod');
const { errorResponse } = require('../utils/response.utils');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      params: req.params,
      query: req.query
    });
    return next();
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(res, error.issues[0]?.message || 'Invalid request data', 400, {
        issues: error.issues
      });
    }

    return next(error);
  }
};

module.exports = validate;
