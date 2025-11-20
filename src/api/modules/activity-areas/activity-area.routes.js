const express = require('express');
const router = express.Router();
const activityAreaController = require('./activity-area.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/rbacMiddleware');
const { cacheMiddleware } = require('../../middlewares/cacheMiddleware');
const { validationMiddleware } = require('../../validators/dynamicValidator');

/**
 * @swagger
 * tags:
 *   name: Activity Areas
 *   description: Faaliyet alanları yönetimi - İnsani yardım faaliyet alanlarını yönetin
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ActivityArea:
 *       type: object
 *       required:
 *         - translations
 *       properties:
 *         id:
 *           type: integer
 *           description: Faaliyet alanı ID
 *         icon:
 *           type: string
 *           description: İkon sınıfı veya URL
 *           example: fa fa-heart
 *         displayOrder:
 *           type: integer
 *           description: Görüntülenme sırası
 *           default: 0
 *         isActive:
 *           type: boolean
 *           description: Aktif durumu
 *           default: true
 *         translations:
 *           type: array
 *           description: Çoklu dil içerikleri
 *           items:
 *             type: object
 *             properties:
 *               language:
 *                 type: string
 *                 enum: [tr, en, ar]
 *                 example: tr
 *               title:
 *                 type: string
 *                 example: Beslenme ve Sağlık
 *               slug:
 *                 type: string
 *                 example: beslenme-ve-sagligi
 *               description:
 *                 type: string
 *                 example: Açlık ve yetersiz beslenme sorunlarıyla mücadele ediyoruz
 *               content:
 *                 type: string
 *                 example: Detaylı açıklama içeriği...
 *               metaTitle:
 *                 type: string
 *               metaDescription:
 *                 type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /activity-areas/active:
 *   get:
 *     summary: Get all active activity areas (Public)
 *     description: Retrieve all active activity areas with pagination (cached for 10 minutes)
 *     tags: [Activity Areas]
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
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [tr, en, ar]
 *           default: tr
 *         description: Language code
 *     responses:
 *       200:
 *         description: Active activity areas retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ActivityArea'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 */
router.get('/active', cacheMiddleware(600), activityAreaController.getActiveActivityAreas);

/**
 * @swagger
 * /activity-areas/slug/{slug}:
 *   get:
 *     summary: Get activity area by slug (Public)
 *     description: Retrieve a single activity area by its slug (cached for 10 minutes)
 *     tags: [Activity Areas]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Activity area slug
 *         example: beslenme-ve-sagligi
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [tr, en, ar]
 *           default: tr
 *         description: Language code
 *     responses:
 *       200:
 *         description: Activity area retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActivityArea'
 *       404:
 *         description: Activity area not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/slug/:slug', cacheMiddleware(600), activityAreaController.getActivityAreaBySlug);

// Protected routes (require authentication)
router.use(authMiddleware);

/**
 * @swagger
 * /activity-areas:
 *   get:
 *     summary: Tüm faaliyet alanlarını getir (Admin)
 *     tags: [Activity Areas]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Sayfa numarası
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Sayfa başına öğe sayısı
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [tr, en, ar]
 *           default: tr
 *         description: Dil seçimi
 *     responses:
 *       200:
 *         description: Faaliyet alanları başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ActivityArea'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 *       401:
 *         description: Yetkisiz erişim
 *       403:
 *         description: Yetki eksikliği
 */

// Admin routes with permission checks
router.get(
  '/',
  checkPermission('activity-areas', 'read'),
  activityAreaController.getAllActivityAreas
);

/**
 * @swagger
 * /activity-areas/{id}:
 *   get:
 *     summary: ID ile faaliyet alanı getir (Admin)
 *     tags: [Activity Areas]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Faaliyet alanı ID
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [tr, en, ar]
 *           default: tr
 *         description: Dil seçimi
 *     responses:
 *       200:
 *         description: Faaliyet alanı başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActivityArea'
 *       404:
 *         description: Faaliyet alanı bulunamadı
 *       401:
 *         description: Yetkisiz erişim
 */
router.get(
  '/:id',
  checkPermission('activity-areas', 'read'),
  activityAreaController.getActivityAreaById
);

/**
 * @swagger
 * /activity-areas:
 *   post:
 *     summary: Yeni faaliyet alanı oluştur (Admin)
 *     tags: [Activity Areas]
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
 *               - translations
 *             properties:
 *               icon:
 *                 type: string
 *                 example: fa fa-heart
 *               displayOrder:
 *                 type: integer
 *                 default: 0
 *               isActive:
 *                 type: boolean
 *                 default: true
 *               translations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - language
 *                     - title
 *                     - slug
 *                   properties:
 *                     language:
 *                       type: string
 *                       enum: [tr, en, ar]
 *                     title:
 *                       type: string
 *                     slug:
 *                       type: string
 *                     description:
 *                       type: string
 *                     content:
 *                       type: string
 *                     metaTitle:
 *                       type: string
 *                     metaDescription:
 *                       type: string
 *     responses:
 *       201:
 *         description: Faaliyet alanı başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/ActivityArea'
 *       400:
 *         description: Geçersiz veri
 *       401:
 *         description: Yetkisiz erişim
 */
router.post(
  '/',
  checkPermission('activity-areas', 'create'),
  validationMiddleware('activity-areas'),
  activityAreaController.createActivityArea
);

/**
 * @swagger
 * /activity-areas/{id}:
 *   put:
 *     summary: Faaliyet alanını güncelle (Admin)
 *     tags: [Activity Areas]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Faaliyet alanı ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               icon:
 *                 type: string
 *               displayOrder:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *               translations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     language:
 *                       type: string
 *                       enum: [tr, en, ar]
 *                     title:
 *                       type: string
 *                     slug:
 *                       type: string
 *                     description:
 *                       type: string
 *                     content:
 *                       type: string
 *                     metaTitle:
 *                       type: string
 *                     metaDescription:
 *                       type: string
 *     responses:
 *       200:
 *         description: Faaliyet alanı başarıyla güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/ActivityArea'
 *       404:
 *         description: Faaliyet alanı bulunamadı
 *       401:
 *         description: Yetkisiz erişim
 */
router.put(
  '/:id',
  checkPermission('activity-areas', 'update'),
  validationMiddleware('activity-areas'),
  activityAreaController.updateActivityArea
);

/**
 * @swagger
 * /activity-areas/{id}:
 *   delete:
 *     summary: Faaliyet alanını sil (Admin)
 *     tags: [Activity Areas]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Faaliyet alanı ID
 *     responses:
 *       200:
 *         description: Faaliyet alanı başarıyla silindi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Faaliyet alanı bulunamadı
 *       401:
 *         description: Yetkisiz erişim
 */
router.delete(
  '/:id',
  checkPermission('activity-areas', 'delete'),
  activityAreaController.deleteActivityArea
);

// ========== PAGE BUILDER ROUTES ==========

/**
 * @swagger
 * /activity-areas/{id}/builder:
 *   put:
 *     summary: Update activity area page builder data
 *     description: Save page builder content for a specific activity area and language
 *     tags: [Activity Areas - Page Builder]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Activity Area ID
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
 *         description: Activity Area not found
 */
router.put('/:id/builder',
  checkPermission('activity-areas', 'update'),
  activityAreaController.updateBuilderData
);

/**
 * @swagger
 * /activity-areas/{id}/builder:
 *   get:
 *     summary: Get activity area page builder data
 *     description: Retrieve page builder content for a specific activity area and language
 *     tags: [Activity Areas - Page Builder]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Activity Area ID
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
 *         description: Activity Area not found
 */
router.get('/:id/builder',
  checkPermission('activity-areas', 'read'),
  activityAreaController.getBuilderData
);

/**
 * @swagger
 * /activity-areas/migrate-to-builder:
 *   post:
 *     summary: Migrate content to page builder
 *     description: Convert existing activity area content to page builder format (Admin only)
 *     tags: [Activity Areas - Migration]
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
  checkPermission('activity-areas', 'update'),
  activityAreaController.migrateContentToBuilder
);

module.exports = router;
