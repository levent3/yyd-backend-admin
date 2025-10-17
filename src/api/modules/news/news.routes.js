const express = require('express');
const router = express.Router();
const newsController = require('./news.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/permissionMiddleware');
const { cacheMiddleware } = require('../../middlewares/cacheMiddleware');

/**
 * @swagger
 * /news/published:
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
 * /news/slug/{slug}:
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
  newsController.createNews
);

router.put(
  '/:id',
  checkPermission('news', 'update'),
  newsController.updateNews
);

router.delete(
  '/:id',
  checkPermission('news', 'delete'),
  newsController.deleteNews
);

module.exports = router;
