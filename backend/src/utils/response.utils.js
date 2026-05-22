const successResponse = (res, data = null, message = 'OK', status = 200) => {
  return res.status(status).json({ success: true, data, message });
};

const paginatedResponse = (res, data, pagination, message = 'OK', status = 200) => {
  return res.status(status).json({ success: true, data, message, pagination });
};

const errorResponse = (res, message = 'Internal server error', status = 500, data = null) => {
  return res.status(status).json({ success: false, data, message });
};

module.exports = {
  successResponse,
  paginatedResponse,
  errorResponse
};
