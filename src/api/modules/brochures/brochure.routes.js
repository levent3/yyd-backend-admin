const express = require('express');
const brochureController = require('./brochure.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/rbacMiddleware');
const { cacheMiddleware } = require('../../middlewares/cacheMiddleware');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Brochure:
 *       type: object
 *       required:
 *         - pdfUrl
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID
 *         pdfUrl:
 *           type: string
 *           description: PDF dosya URL'i
 *           example: "/uploads/brochures/yyd-catalog-2024.pdf"
 *         category:
 *           type: string
 *           description: Kategori
 *           example: "Sağlık"
 *         thumbnailUrl:
 *           type: string
 *           description: Önizleme görseli
 *           example: "/uploads/brochures/yyd-catalog-2024-thumb.jpg"
 *         fileSize:
 *           type: integer
 *           description: Dosya boyutu (bytes)
 *           example: 2048000
 *         projectId:
 *           type: integer
 *           description: İlişkili proje ID (opsiyonel)
 *           example: 1
 *         campaignId:
 *           type: integer
 *           description: İlişkili kampanya ID (opsiyonel)
 *           example: 1
 *         isActive:
 *           type: boolean
 *           description: Aktif mi?
 *           example: true
 *         displayOrder:
 *           type: integer
 *           description: Sıralama
 *           example: 0
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
 *                 example: "YYD 2024 Kataloğu"
 *               description:
 *                 type: string
 *                 example: "YYD'nin 2024 yılı faaliyetlerini içeren katalog"
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
 * /api/brochures/public:
 *   get:
 *     summary: Get all active brochures (Public)
 *     description: Tüm aktif broşürleri getir (public)
 *     tags: [Brochures]
 *     parameters:
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [tr, en, ar]
 *         description: Dil (opsiyonel)
 *     responses:
 *       200:
 *         description: Brochures successfully retrieved
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
 *                     $ref: '#/components/schemas/Brochure'
 */
router.get('/public', cacheMiddleware(3600), brochureController.getAllActiveBrochures);

/**
 * @swagger
 * /api/brochures/category/{category}:
 *   get:
 *     summary: Get brochures by category (Public)
 *     description: Belirli bir kategoride broşürleri getir
 *     tags: [Brochures]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Broşür kategorisi (örn. Sağlık, Eğitim, Acil Yardım)
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [tr, en, ar]
 *         description: Dil (opsiyonel)
 *     responses:
 *       200:
 *         description: Brochures successfully retrieved
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
 *                     $ref: '#/components/schemas/Brochure'
 */
router.get('/category/:category', cacheMiddleware(3600), brochureController.getBrochuresByCategory);

// ========== ADMIN ROUTES (Auth required) ==========
router.use(authMiddleware);

/**
 * @swagger
 * /api/brochures:
 *   get:
 *     summary: Get all brochures (Admin)
 *     description: Tüm broşürleri getir (pagination ile)
 *     tags: [Brochures]
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
 *         name: projectId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: campaignId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: isActive
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
 *                     $ref: '#/components/schemas/Brochure'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 */
router.get('/', checkPermission('media', 'read'), brochureController.getAllBrochures);

/**
 * @swagger
 * /api/brochures/{id}:
 *   get:
 *     summary: Get brochure by ID (Admin)
 *     tags: [Brochures]
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
 *         description: Brochure not found
 */
router.get('/:id', checkPermission('media', 'read'), brochureController.getBrochureById);

/**
 * @swagger
 * /api/brochures:
 *   post:
 *     summary: Create brochure (Admin)
 *     tags: [Brochures]
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
 *               - pdfUrl
 *               - translations
 *             properties:
 *               pdfUrl:
 *                 type: string
 *               category:
 *                 type: string
 *               thumbnailUrl:
 *                 type: string
 *               fileSize:
 *                 type: integer
 *               projectId:
 *                 type: integer
 *               campaignId:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *               displayOrder:
 *                 type: integer
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
 *         description: Brochure created successfully
 */
router.post('/', checkPermission('media', 'create'), brochureController.createBrochure);

/**
 * @swagger
 * /api/brochures/{id}:
 *   put:
 *     summary: Update brochure (Admin)
 *     tags: [Brochures]
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
 *             $ref: '#/components/schemas/Brochure'
 *     responses:
 *       200:
 *         description: Brochure updated successfully
 *       404:
 *         description: Brochure not found
 */
router.put('/:id', checkPermission('media', 'update'), brochureController.updateBrochure);

/**
 * @swagger
 * /api/brochures/{id}:
 *   delete:
 *     summary: Delete brochure (Admin)
 *     tags: [Brochures]
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
 *         description: Brochure deleted successfully
 *       404:
 *         description: Brochure not found
 */
router.delete('/:id', checkPermission('media', 'delete'), brochureController.deleteBrochure);

// ========== PAGE BUILDER ROUTES ==========

/**
 * @swagger
 * /api/brochures/{id}/builder:
 *   put:
 *     summary: Update brochure page builder data
 *     description: Save page builder content for a specific brochure and language
 *     tags: [Brochures]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Brochure ID
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
 *               builderData:
 *                 type: array
 *                 description: Widget array for page builder
 *               builderHtml:
 *                 type: string
 *                 description: Rendered HTML (cache)
 *               builderCss:
 *                 type: string
 *                 description: Custom CSS
 *     responses:
 *       200:
 *         description: Builder data successfully updated
 *       404:
 *         description: Brochure not found
 */
router.put('/:id/builder',
  checkPermission('media', 'update'),
  brochureController.updateBuilderData
);

/**
 * @swagger
 * /api/brochures/{id}/builder:
 *   get:
 *     summary: Get brochure page builder data
 *     description: Retrieve page builder content for a specific brochure and language
 *     tags: [Brochures]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Brochure ID
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [tr, en, ar]
 *           default: tr
 *     responses:
 *       200:
 *         description: Builder data successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 builderData:
 *                   type: array
 *                 builderHtml:
 *                   type: string
 *                 builderCss:
 *                   type: string
 *                 usePageBuilder:
 *                   type: boolean
 *       404:
 *         description: Brochure not found
 */
router.get('/:id/builder',
  checkPermission('media', 'read'),
  brochureController.getBuilderData
);

/**
 * @swagger
 * /api/brochures/migrate-to-builder:
 *   post:
 *     summary: Migrate brochure descriptions to page builder
 *     description: One-time migration to convert existing descriptions to page builder widgets
 *     tags: [Brochures]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Migration completed
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
 */
router.post('/migrate-to-builder',
  checkPermission('media', 'create'),
  brochureController.migrateContentToBuilder
);

module.exports = router;
