// src/api/middlewares/requestLogger.js
const logger = require('../../config/logger');

/**
 * HTTP Request logging middleware
 * Her gelen request için bilgi loglar
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Response bittiğinde log yaz
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.userId,
    };

    // Status code'a göre log level belirle
    if (res.statusCode >= 500) {
      logger.error('HTTP Request', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });

  next();
};

module.exports = requestLogger;
