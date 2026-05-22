require('dotenv').config();

const http = require('http');
const app = require('./app');
const validateEnv = require('./config/validateEnv');
const { connectDatabase, disconnectDatabase } = require('./config/database');
const { startMeetingWorker } = require('./queues/workers/meeting.worker');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  validateEnv();

  await connectDatabase();
  startMeetingWorker();

  const server = http.createServer(app);

  server.listen(PORT, () => {
    logger.info(`SyncMind API listening on port ${PORT}`);
  });

  const shutdown = async (signal) => {
    logger.info(`${signal} received. Shutting down gracefully.`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

startServer().catch((error) => {
  logger.error('Failed to start server', {
    message: error.message,
    stack: error.stack
  });
  process.exit(1);
});
