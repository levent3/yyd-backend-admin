const { createClient } = require('redis');
const logger = require('./logger');

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => {
  logger.error('Redis Client Error', { error: err.message });
});

redisClient.on('connect', () => {
  logger.info('Redis Client Connected');
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    logger.error('Failed to connect to Redis', { error: err.message });
  }
})();

module.exports = redisClient;
