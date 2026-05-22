const express = require('express');
const { successResponse } = require('../utils/response.utils');

const router = express.Router();

router.get('/health', (req, res) => {
  successResponse(res, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
