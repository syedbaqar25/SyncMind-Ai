const { Queue } = require('bullmq');
const { getRedisClient } = require('../config/redis');

const meetingProcessorQueue = new Queue('meeting-processing', {
  connection: getRedisClient(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: 100,
    removeOnFail: 50
  }
});

module.exports = {
  meetingProcessorQueue
};
