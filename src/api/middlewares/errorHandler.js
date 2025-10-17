// src/api/middlewares/errorHandler.js
const logger = require('../../config/logger');
const { serverErrorResponse, errorResponse } = require('../../utils/responseFormatter');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  // Winston logger ile hata kaydı
  logger.error('Error occurred', {
    message: err.message,
    statusCode,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user?.userId,
    stack: err.stack,
  });

  // Standardize edilmiş hata response'u kullan
  if (statusCode === 500) {
    return serverErrorResponse(
      res,
      err.message || 'Sunucuda beklenmedik bir hata oluştu.',
      err
    );
  }

  // Diğer HTTP hataları için
  return errorResponse(
    res,
    err.message || 'Bir hata oluştu.',
    statusCode,
    process.env.NODE_ENV === 'development' ? { stack: err.stack } : null
  );
};

module.exports = errorHandler;