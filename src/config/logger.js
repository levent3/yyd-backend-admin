const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

// Log seviyesi belirleme
const level = process.env.LOG_LEVEL || 'info';

// Log formatı
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format (development için daha okunabilir)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Error log transport (sadece error'lar)
const errorFileTransport = new winston.transports.DailyRotateFile({
  filename: path.join('logs', 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxFiles: '30d', // 30 gün sonra sil
  maxSize: '20m', // 20MB'dan büyük olursa yeni dosya aç
  format: logFormat,
});

// Combined log transport (tüm loglar)
const combinedFileTransport = new winston.transports.DailyRotateFile({
  filename: path.join('logs', 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d', // 14 gün sonra sil
  maxSize: '20m',
  format: logFormat,
});

// Winston logger oluştur
const logger = winston.createLogger({
  level,
  format: logFormat,
  defaultMeta: { service: 'yyd-backend' },
  transports: [
    errorFileTransport,
    combinedFileTransport,
  ],
  exitOnError: false,
});

// Development'ta console'a da yaz
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
  }));
}

// Stream for Morgan HTTP logger
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

module.exports = logger;
