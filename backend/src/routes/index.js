const express = require('express');
const { successResponse } = require('../utils/response.utils');
const authRoutes = require('./auth.routes');

const router = express.Router();

router.use('/auth', authRoutes);

router.get('/health', (req, res) => {
  successResponse(res, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
