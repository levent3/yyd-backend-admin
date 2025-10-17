const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// Genel API rate limiter - 15 dakikada 100 istek
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // maksimum 100 istek
  message: {
    message: 'Çok fazla istek gönderildi. Lütfen 15 dakika sonra tekrar deneyin.',
    retryAfter: 15 * 60 // saniye cinsinden
  },
  standardHeaders: true, // `RateLimit-*` header'larını döndür
  legacyHeaders: false, // `X-RateLimit-*` header'larını devre dışı bırak
  // Güvenilir proxy'ler için
  trustProxy: process.env.NODE_ENV === 'production',
});

// Login endpoint için özel rate limiter - 15 dakikada 5 deneme
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 5, // maksimum 5 login denemesi
  message: {
    message: 'Çok fazla giriş denemesi yapıldı. Lütfen 15 dakika sonra tekrar deneyin.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Başarılı login'ler sayılmasın
  trustProxy: process.env.NODE_ENV === 'production',
});

// Kayıt endpoint için rate limiter - Saatte 3 kayıt
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 3, // maksimum 3 kayıt
  message: {
    message: 'Çok fazla kayıt denemesi yapıldı. Lütfen 1 saat sonra tekrar deneyin.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: process.env.NODE_ENV === 'production',
});

// Create/Update/Delete işlemleri için - Dakikada 20 istek
const mutationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 dakika
  max: 20, // maksimum 20 istek
  message: {
    message: 'Çok fazla yazma işlemi yapıldı. Lütfen 1 dakika bekleyin.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: process.env.NODE_ENV === 'production',
});

// Speed limiter - Çok fazla istek olunca yavaşlatır (soft limit)
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 dakika
  delayAfter: 50, // 50 istekten sonra yavaşlatmaya başla
  delayMs: 500, // Her istekte 500ms gecikme ekle
  maxDelayMs: 20000, // Maksimum 20 saniye gecikme
});

// Public endpoint limiter - Herkese açık API'ler için (bagış, sepet, kampanyalar)
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 200, // Public için daha yüksek limit
  message: {
    message: 'Çok fazla istek gönderildi. Lütfen 15 dakika sonra tekrar deneyin.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: process.env.NODE_ENV === 'production',
});

// Admin panel limiter - Authenticated admin işlemleri için
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 500, // Admin panel için yüksek limit
  message: {
    message: 'Çok fazla istek gönderildi. Lütfen 15 dakika sonra tekrar deneyin.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: process.env.NODE_ENV === 'production',
});

// Upload işlemleri için özel limiter - Dosya yükleme işlemleri için
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 30, // 15 dakikada maksimum 30 dosya upload
  message: {
    message: 'Çok fazla dosya yükleme işlemi yapıldı. Lütfen 15 dakika bekleyin.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: process.env.NODE_ENV === 'production',
});

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
