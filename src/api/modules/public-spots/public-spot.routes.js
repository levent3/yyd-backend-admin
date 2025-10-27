const express = require('express');
const publicSpotController = require('./public-spot.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/rbacMiddleware');
const { cacheMiddleware } = require('../../middlewares/cacheMiddleware');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PublicSpot:
 *       type: object
 *       required:
 *         - videoUrl
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID
 *         videoUrl:
 *           type: string
 *           description: Video URL (YouTube, Vimeo, self-hosted)
 *           example: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
 *         videoType:
 *           type: string
 *           description: Video tipi
 *           enum: [youtube, vimeo, self-hosted]
 *           default: youtube
 *           example: "youtube"
 *         thumbnailUrl:
 *           type: string
 *           description: Thumbnail görseli
 *           example: "/uploads/spots/thumbnail.jpg"
 *         duration:
 *           type: integer
 *           description: Video süresi (saniye)
 *           example: 180
 *         category:
 *           type: string
 *           description: Kategori
 *           example: "Sağlık"
 *         viewCount:
 *           type: integer
 *           description: Görüntülenme sayısı
 *           example: 1500
 *         isActive:
 *           type: boolean
 *           description: Aktif mi?
 *           example: true
 *         isFeatured:
 *           type: boolean
 *           description: Öne çıkarılmış mı?
 *           example: false
 *         displayOrder:
 *           type: integer
 *           description: Sıralama
 *           example: 0
 *         publishedAt:
 *           type: string
 *           format: date-time
 *           description: Yayınlanma tarihi
 *         translations:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               language:
 *                 type: string
 *                 enum: [tr, en, ar]
 *               title:
 *                 type: string
 *                 example: "YYD Sağlık Projesi Tanıtım Videosu"
 *               description:
 *                 type: string
 *                 example: "YYD'nin sağlık alanındaki çalışmalarını anlatan video"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// ========== PUBLIC ROUTES ==========

/**
 * @swagger
 * /api/public-spots/public:
 *   get:
 *     summary: Get all active public spots (Public)
 *     description: Tüm aktif kamu spotlarını getir
 *     tags: [Public Spots]
 *     parameters:
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [tr, en, ar]
 *         description: Dil (opsiyonel)
 *     responses:
 *       200:
 *         description: Public spots successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PublicSpot'
 */
router.get('/public', cacheMiddleware(3600), publicSpotController.getAllActivePublicSpots);

/**
 * @swagger
 * /api/public-spots/featured:
 *   get:
 *     summary: Get featured public spots (Public)
 *     description: Öne çıkan kamu spotlarını getir
 *     tags: [Public Spots]
 *     parameters:
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [tr, en, ar]
 *         description: Dil (opsiyonel)
 *     responses:
 *       200:
 *         description: Featured public spots successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PublicSpot'
 */
router.get('/featured', cacheMiddleware(1800), publicSpotController.getFeaturedPublicSpots);

/**
 * @swagger
 * /api/public-spots/category/{category}:
 *   get:
 *     summary: Get public spots by category (Public)
 *     description: Belirli bir kategoride kamu spotlarını getir
 *     tags: [Public Spots]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Kategori
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [tr, en, ar]
 *         description: Dil (opsiyonel)
 *     responses:
 *       200:
 *         description: Public spots successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PublicSpot'
 */
router.get('/category/:category', cacheMiddleware(3600), publicSpotController.getPublicSpotsByCategory);

/**
 * @swagger
 * /api/public-spots/{id}/view:
 *   post:
 *     summary: Increment view count (Public)
 *     description: Video görüntülenme sayısını artır
 *     tags: [Public Spots]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: View count incremented
 */
router.post('/:id/view', publicSpotController.incrementViewCount);

// ========== ADMIN ROUTES (Auth required) ==========
router.use(authMiddleware);

/**
 * @swagger
 * /api/public-spots:
 *   get:
 *     summary: Get all public spots (Admin)
 *     description: Tüm kamu spotlarını getir (pagination ile)
 *     tags: [Public Spots]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: videoType
 *         schema:
 *           type: string
 *           enum: [youtube, vimeo, self-hosted]
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [tr, en, ar]
 *     responses:
 *       200:
 *         description: Successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PublicSpot'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 */
router.get('/', checkPermission('media', 'read'), publicSpotController.getAllPublicSpots);

/**
 * @swagger
 * /api/public-spots/{id}:
 *   get:
 *     summary: Get public spot by ID (Admin)
 *     tags: [Public Spots]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [tr, en, ar]
 *     responses:
 *       200:
 *         description: Successfully retrieved
 *       404:
 *         description: Public spot not found
 */
router.get('/:id', checkPermission('media', 'read'), publicSpotController.getPublicSpotById);

/**
 * @swagger
 * /api/public-spots:
 *   post:
 *     summary: Create public spot (Admin)
 *     tags: [Public Spots]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - videoUrl
 *               - translations
 *             properties:
 *               videoUrl:
 *                 type: string
 *               videoType:
 *                 type: string
 *                 enum: [youtube, vimeo, self-hosted]
 *               thumbnailUrl:
 *                 type: string
 *               duration:
 *                 type: integer
 *               category:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               isFeatured:
 *                 type: boolean
 *               displayOrder:
 *                 type: integer
 *               publishedAt:
 *                 type: string
 *                 format: date-time
 *               translations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - language
 *                     - title
 *                   properties:
 *                     language:
 *                       type: string
 *                       enum: [tr, en, ar]
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *     responses:
 *       201:
 *         description: Public spot created successfully
 */
router.post('/', checkPermission('media', 'create'), publicSpotController.createPublicSpot);

/**
 * @swagger
 * /api/public-spots/{id}:
 *   put:
 *     summary: Update public spot (Admin)
 *     tags: [Public Spots]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PublicSpot'
 *     responses:
 *       200:
 *         description: Public spot updated successfully
 *       404:
 *         description: Public spot not found
 */
router.put('/:id', checkPermission('media', 'update'), publicSpotController.updatePublicSpot);

/**
 * @swagger
 * /api/public-spots/{id}:
 *   delete:
 *     summary: Delete public spot (Admin)
 *     tags: [Public Spots]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Public spot deleted successfully
 *       404:
 *         description: Public spot not found
 */
router.delete('/:id', checkPermission('media', 'delete'), publicSpotController.deletePublicSpot);

module.exports = router;
