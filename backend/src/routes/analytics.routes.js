const express = require('express');
const analyticsController = require('../controllers/analytics.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/overview', analyticsController.overview);
router.get('/meetings-over-time', analyticsController.meetingsOverTime);
router.get('/task-completion', analyticsController.taskCompletion);
router.get('/top-speakers', analyticsController.topSpeakers);
router.get('/sentiment-trends', analyticsController.sentimentTrends);
router.get('/duration-distribution', analyticsController.durationDistribution);

module.exports = router;
