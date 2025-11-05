// src/app.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./api/middlewares/errorHandler');
const requestLogger = require('./api/middlewares/requestLogger');
const {
  generalLimiter,
  speedLimiter,
  publicLimiter,
  adminLimiter,
  uploadLimiter
} = require('./api/middlewares/rateLimitMiddleware');

// Rotalarımızı daha sonra buraya ekleyeceğiz
const authRoutes = require('./api/modules/auth/auth.routes');
const projectRoutes = require('./api/modules/projects/project.routes');
const roleRoutes = require('./api/modules/roles/role.routes');
const moduleRoutes = require('./api/modules/modules/module.routes');
const userRoutes = require('./api/modules/users/user.routes');
const donationRoutes = require('./api/modules/donations/donation.routes');
const newsRoutes = require('./api/modules/news/news.routes');
const galleryRoutes = require('./api/modules/gallery/gallery.routes');
const contactRoutes = require('./api/modules/contact/contact.routes');
const volunteerRoutes = require('./api/modules/volunteers/volunteer.routes');
const careerRoutes = require('./api/modules/careers/career.routes');
const recurringDonationRoutes = require('./api/modules/recurring-donations/recurring-donation.routes');
const paymentTransactionRoutes = require('./api/modules/payment-transactions/payment-transaction.routes');
const cartRoutes = require('./api/modules/cart/cart.routes');
const uploadRoutes = require('./api/modules/upload/upload.routes');
const validationRuleRoutes = require('./api/modules/validation-rules/validation-rule.routes');
const projectSettingsRoutes = require('./api/modules/project-settings/project-settings.routes');
const systemSettingsRoutes = require('./api/modules/system-settings/system-settings.routes');
const dashboardRoutes = require('./api/modules/dashboard/dashboard.routes');
const pageRoutes = require('./api/modules/pages/page.routes');
const timelineRoutes = require('./api/modules/timeline/timeline.routes');
const teamMemberRoutes = require('./api/modules/team-members/team-member.routes');
const brandAssetRoutes = require('./api/modules/brand-assets/brand-asset.routes');
const brochureRoutes = require('./api/modules/brochures/brochure.routes');
const publicSpotRoutes = require('./api/modules/public-spots/public-spot.routes');
const successStoryRoutes = require('./api/modules/success-stories/success-story.routes');
const mediaCoverageRoutes = require('./api/modules/media-coverage/media-coverage.routes');
const jobPositionRoutes = require('./api/modules/job-positions/job-position.routes');
const activityAreaRoutes = require('./api/modules/activity-areas/activity-area.routes');
const bankRoutes = require('./api/modules/banks/bank.routes');
const binCodeRoutes = require('./api/modules/bin-codes/bin-code.routes');

const app = express();

// CORS middleware'i (en başta olmalı - static dosyalar için de gerekli)
const allowedOrigins = [
  process.env.ADMIN_PANEL_URL,          // Admin panel (production)
  'http://10.200.3.110',                // Admin panel via Nginx (no port)
  process.env.PUBLIC_WEBSITE_URL,       // Public website (production)
  'http://localhost:3000',              // Admin panel (development)
  'http://localhost:3001',              // Public website (development)
  'http://localhost:3002',              // Admin panel (development - alternative port)
  'http://localhost:5000',              // Swagger için
];

app.use(cors({
  origin: function (origin, callback) {
    // origin undefined ise (Postman, server-to-server) veya allowed listede ise
    if (!origin || allowedOrigins.some(allowed => allowed && origin.startsWith(allowed))) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy: Origin not allowed'));
    }
  },
  credentials: true // Cookie'lerin gönderilmesine izin ver
}));

// Güvenlik middleware'i (CORS'tan sonra)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Static dosyalar için gerekli
  contentSecurityPolicy: false, // Development için CSP'yi kapat
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (rate limiting'den önce)
app.use(requestLogger);

// Statik dosyalar (yüklenen görseller) - CORS'tan sonra
app.use('/uploads', express.static('uploads'));

// Rate limiting middleware'lerini ekle - Route bazlı optimizasyon
// Public endpoints için daha yüksek limitler
app.use('/api/donations/public', publicLimiter);
app.use('/api/donations/campaigns', publicLimiter);
app.use('/api/cart', publicLimiter);
app.use('/api/contact', publicLimiter);
app.use('/api/volunteers/apply', publicLimiter);
app.use('/api/system-settings/public', publicLimiter);

// Upload endpoints için özel limiter
app.use('/api/upload', uploadLimiter);

// Genel API rate limiting (authenticated routes için)
app.use('/api/', speedLimiter); // Soft limit - yavaşlatma
app.use('/api/', generalLimiter); // Hard limit - blocking

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'YYD API Documentation',
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check if the API is running
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get('/api/health', (req, res) => {
  res.send({ status: 'OK', timestamp: new Date() });
});

// API Rotaları
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/recurring-donations', recurringDonationRoutes);
app.use('/api/payment-transactions', paymentTransactionRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/validation-rules', validationRuleRoutes);
app.use('/api/project-settings', projectSettingsRoutes);
app.use('/api/system-settings', systemSettingsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/timelines', timelineRoutes);
app.use('/api/team-members', teamMemberRoutes);
app.use('/api/brand-assets', brandAssetRoutes);
app.use('/api/brochures', brochureRoutes);
app.use('/api/public-spots', publicSpotRoutes);
app.use('/api/success-stories', successStoryRoutes);
app.use('/api/media-coverage', mediaCoverageRoutes);
app.use('/api/job-positions', jobPositionRoutes);
app.use('/api/activity-areas', activityAreaRoutes);
app.use('/api/banks', bankRoutes);
app.use('/api/bin-codes', binCodeRoutes);

// Hata Yönetimi (en sonda olmalı)
app.use(errorHandler);

module.exports = app;