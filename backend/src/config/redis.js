const Redis = require('ioredis');
const logger = require('../utils/logger');

let redis;

const getRedisClient = () => {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false
    });

    redis.on('connect', () => logger.info('Redis connected'));
    redis.on('error', (error) => logger.error('Redis error', { error: error.message }));
  }

  return redis;
};

module.exports = {
  getRedisClient
};
