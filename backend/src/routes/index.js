const express = require('express');
const { successResponse } = require('../utils/response.utils');
const authRoutes = require('./auth.routes');
const workspaceRoutes = require('./workspace.routes');
const userRoutes = require('./user.routes');
const meetingRoutes = require('./meeting.routes');
const taskRoutes = require('./task.routes');
const analyticsRoutes = require('./analytics.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/workspaces', workspaceRoutes);
router.use('/users', userRoutes);
router.use('/meetings', meetingRoutes);
router.use('/tasks', taskRoutes);
router.use('/analytics', analyticsRoutes);

router.get('/health', (req, res) => {
  successResponse(res, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
