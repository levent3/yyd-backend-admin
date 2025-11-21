const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// Genel API rate limiter - Development'ta devre dışı
const generalLimiter = process.env.NODE_ENV === 'production'
  ? rateLimit({
      windowMs: 15 * 60 * 1000, // 15 dakika
      max: 100, // maksimum 100 istek
      message: {
        message: 'Çok fazla istek gönderildi. Lütfen 15 dakika sonra tekrar deneyin.',
        retryAfter: 15 * 60
      },
      standardHeaders: true,
      legacyHeaders: false,
      trustProxy: true,
    })
  : (req, res, next) => next(); // Development: Rate limit yok

// Login endpoint için özel rate limiter - Development'ta devre dışı
const loginLimiter = process.env.NODE_ENV === 'production'
  ? rateLimit({
      windowMs: 15 * 60 * 1000, // 15 dakika
      max: 5, // Production: 5 deneme
      message: {
        message: 'Çok fazla giriş denemesi yapıldı. Lütfen 15 dakika sonra tekrar deneyin.',
        retryAfter: 15 * 60
      },
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: true,
      trustProxy: true,
    })
  : (req, res, next) => next(); // Development: Rate limit yok

// Kayıt endpoint için rate limiter - Development'ta devre dışı
const registerLimiter = process.env.NODE_ENV === 'production'
  ? rateLimit({
      windowMs: 60 * 60 * 1000, // 1 saat
      max: 3, // maksimum 3 kayıt
      message: {
        message: 'Çok fazla kayıt denemesi yapıldı. Lütfen 1 saat sonra tekrar deneyin.',
        retryAfter: 60 * 60
      },
      standardHeaders: true,
      legacyHeaders: false,
      trustProxy: true,
    })
  : (req, res, next) => next(); // Development: Rate limit yok

// Create/Update/Delete işlemleri için - Development'ta devre dışı
const mutationLimiter = process.env.NODE_ENV === 'production'
  ? rateLimit({
      windowMs: 60 * 1000, // 1 dakika
      max: 20, // maksimum 20 istek
      message: {
        message: 'Çok fazla yazma işlemi yapıldı. Lütfen 1 dakika bekleyin.',
        retryAfter: 60
      },
      standardHeaders: true,
      legacyHeaders: false,
      trustProxy: true,
    })
  : (req, res, next) => next(); // Development: Rate limit yok

// Speed limiter - Development'ta devre dışı
const speedLimiter = process.env.NODE_ENV === 'production'
  ? slowDown({
      windowMs: 15 * 60 * 1000, // 15 dakika
      delayAfter: 50, // 50 istekten sonra yavaşlatmaya başla
      delayMs: () => 500, // Her istekte 500ms gecikme ekle
      maxDelayMs: 20000, // Maksimum 20 saniye gecikme
      validate: { delayMs: false },
    })
  : (req, res, next) => next(); // Development: Speed limit yok

// Public endpoint limiter - Development'ta devre dışı
const publicLimiter = process.env.NODE_ENV === 'production'
  ? rateLimit({
      windowMs: 15 * 60 * 1000, // 15 dakika
      max: 200, // Public için daha yüksek limit
      message: {
        message: 'Çok fazla istek gönderildi. Lütfen 15 dakika sonra tekrar deneyin.',
        retryAfter: 15 * 60
      },
      standardHeaders: true,
      legacyHeaders: false,
      trustProxy: true,
    })
  : (req, res, next) => next(); // Development: Rate limit yok

// Admin panel limiter - Development'ta devre dışı
const adminLimiter = process.env.NODE_ENV === 'production'
  ? rateLimit({
      windowMs: 15 * 60 * 1000, // 15 dakika
      max: 500, // Admin panel için yüksek limit
      message: {
        message: 'Çok fazla istek gönderildi. Lütfen 15 dakika sonra tekrar deneyin.',
        retryAfter: 15 * 60
      },
      standardHeaders: true,
      legacyHeaders: false,
      trustProxy: true,
    })
  : (req, res, next) => next(); // Development: Rate limit yok

// Upload işlemleri için özel limiter - Development'ta devre dışı
const uploadLimiter = process.env.NODE_ENV === 'production'
  ? rateLimit({
      windowMs: 15 * 60 * 1000, // 15 dakika
      max: 30, // 15 dakikada maksimum 30 dosya upload
      message: {
        message: 'Çok fazla dosya yükleme işlemi yapıldı. Lütfen 15 dakika bekleyin.',
        retryAfter: 15 * 60
      },
      standardHeaders: true,
      legacyHeaders: false,
      trustProxy: true,
    })
  : (req, res, next) => next(); // Development: Rate limit yok

module.exports = {
  generalLimiter,
  loginLimiter,
  registerLimiter,
  mutationLimiter,
  speedLimiter,
  publicLimiter,
  adminLimiter,
  uploadLimiter,
};
