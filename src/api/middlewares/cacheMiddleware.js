const redisClient = require('../../config/redisClient');
const logger = require('../../config/logger');

/**
 * Cache middleware - GET request'leri için response caching
 * @param {number} duration - Cache süresi (saniye cinsinden), default 5 dakika
 */
const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    // Sadece GET request'leri cache'le
    if (req.method !== 'GET') {
      return next();
    }

    // Cache key oluştur (path + query parameters)
    const cacheKey = `cache:${req.path}:${JSON.stringify(req.query)}`;

    try {
      // Redis'ten cached data'yı al
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        // Cache hit
        logger.info('Cache HIT', { key: cacheKey, path: req.path });
        return res.json(JSON.parse(cachedData));
      }

      // Cache miss - response'u intercept et
      const originalJson = res.json.bind(res);

      res.json = function(data) {
        // Response'u cache'e kaydet
        redisClient.setEx(cacheKey, duration, JSON.stringify(data))
          .then(() => {
            logger.info('Cache SET', { key: cacheKey, path: req.path, duration });
          })
          .catch((err) => {
            logger.error('Cache SET Error', { key: cacheKey, error: err.message });
          });

        // Original response'u döndür
        return originalJson(data);
      };

      next();
    } catch (err) {
      // Redis hatas ı - cache'siz devam et
      logger.error('Cache Middleware Error', { error: err.message });
      next();
    }
  };
};

/**
 * Cache invalidation helper - Belirli pattern'e uyan tüm cache'leri temizle
 * @param {string} pattern - Redis key pattern (örn: "cache:/api/news*")
 */
const invalidateCache = async (pattern) => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      logger.info('Cache Invalidated', { pattern, count: keys.length });
    }
  } catch (err) {
    logger.error('Cache Invalidation Error', { pattern, error: err.message });
  }
};

module.exports = {
  cacheMiddleware,
  invalidateCache,
};
