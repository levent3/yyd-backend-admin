const express = require('express');
const router = express.Router();
const newsController = require('./news.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/rbacMiddleware');
const { cacheMiddleware } = require('../../middlewares/cacheMiddleware');
const { validationMiddleware } = require('../../validators/dynamicValidator');

/**
 * @swagger
 * /api/news/published:
 *   get:
 *     summary: Get all published news (Public)
 *     description: Retrieve all published news articles with pagination (cached for 10 minutes)
 *     tags: [News]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Published news retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/News'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 */
router.get('/published', cacheMiddleware(600), newsController.getPublishedNews);

/**
 * @swagger
 * /api/news/slug/{slug}:
 *   get:
 *     summary: Get news by slug (Public)
 *     description: Retrieve a single news article by its slug (cached for 10 minutes)
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: News article slug
 *         example: yemen-de-yeni-saglik-merkezi
 *     responses:
 *       200:
 *         description: News article retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/News'
 *       404:
 *         description: News article not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/slug/:slug', cacheMiddleware(600), newsController.getNewsBySlug);

// Protected routes (require authentication)
router.use(authMiddleware);

// Admin routes with permission checks
router.get(
  '/',
  checkPermission('news', 'read'),
  newsController.getAllNews
);

router.get(
  '/:id',
  checkPermission('news', 'read'),
  newsController.getNewsById
);

router.post(
  '/',
  checkPermission('news', 'create'),
  validationMiddleware('news'),
  newsController.createNews
);

router.put(
  '/:id',
  checkPermission('news', 'update'),
  validationMiddleware('news'),
  newsController.updateNews
);

router.delete(
  '/:id',
  checkPermission('news', 'delete'),
  newsController.deleteNews
);

// ========== PAGE BUILDER ROUTES ==========

/**
 * @swagger
 * /api/news/{id}/builder:
 *   put:
 *     summary: Update news page builder data
 *     description: Save page builder content for a specific news and language
 *     tags: [News - Page Builder]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: News ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               language:
 *                 type: string
 *                 enum: [tr, en, ar]
 *                 default: tr
 *                 description: Language code
 *               builderData:
 *                 type: string
 *                 description: JSON string of widget array
 *               builderHtml:
 *                 type: string
 *                 nullable: true
 *                 description: Rendered HTML (optional)
 *               builderCss:
 *                 type: string
 *                 nullable: true
 *                 description: Custom CSS (optional)
 *     responses:
 *       200:
 *         description: Builder data successfully updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: News not found
 */
router.put('/:id/builder',
  checkPermission('news', 'update'),
  newsController.updateBuilderData
);

/**
 * @swagger
 * /api/news/{id}/builder:
 *   get:
 *     summary: Get news page builder data
 *     description: Retrieve page builder content for a specific news and language
 *     tags: [News - Page Builder]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: News ID
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [tr, en, ar]
 *           default: tr
 *         description: Language code
 *     responses:
 *       200:
 *         description: Builder data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 builderData:
 *                   type: object
 *                   nullable: true
 *                 builderHtml:
 *                   type: string
 *                   nullable: true
 *                 builderCss:
 *                   type: string
 *                   nullable: true
 *                 usePageBuilder:
 *                   type: boolean
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: News not found
 */
router.get('/:id/builder',
  checkPermission('news', 'read'),
  newsController.getBuilderData
);

/**
 * @swagger
 * /api/news/migrate-to-builder:
 *   post:
 *     summary: Migrate content to page builder
 *     description: Convert existing news content to page builder format (Admin only)
 *     tags: [News - Migration]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Migration completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     success:
 *                       type: integer
 *                     skipped:
 *                       type: integer
 *                     error:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/migrate-to-builder',
  checkPermission('news', 'update'),
  newsController.migrateContentToBuilder
);

module.exports = router;
