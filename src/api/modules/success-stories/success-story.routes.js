const express = require('express');
const successStoryController = require('./success-story.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/rbacMiddleware');
const { cacheMiddleware } = require('../../middlewares/cacheMiddleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Success Stories
 *   description: Başarı hikayeleri yönetimi - İnsani yardım hikayelerini yayınlayın
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SuccessStory:
 *       type: object
 *       required:
 *         - translations
 *       properties:
 *         id:
 *           type: integer
 *           description: Başarı hikayesi ID
 *         coverImage:
 *           type: string
 *           description: Kapak görseli URL
 *           example: /uploads/success-stories/cover.jpg
 *         images:
 *           type: array
 *           description: Ek görseller (JSON array)
 *           items:
 *             type: string
 *         location:
 *           type: string
 *           description: Şehir/bölge
 *           example: Gaza
 *         country:
 *           type: string
 *           description: Ülke
 *           example: Filistin
 *         projectId:
 *           type: integer
 *           description: İlgili proje ID
 *         isActive:
 *           type: boolean
 *           description: Yayında mı?
 *           default: true
 *         isFeatured:
 *           type: boolean
 *           description: Öne çıkarılsın mı?
 *           default: false
 *         displayOrder:
 *           type: integer
 *           description: Görüntülenme sırası
 *           default: 0
 *         publishedAt:
 *           type: string
 *           format: date-time
 *           description: Yayın tarihi
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
 *                 example: "Gazze'de Yeniden Umut"
 *               slug:
 *                 type: string
 *                 example: gazze-de-yeniden-umut
 *               summary:
 *                 type: string
 *                 example: Kısa özet...
 *               content:
 *                 type: string
 *                 example: Detaylı hikaye...
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
 * /api/success-stories/public:
 *   get:
 *     summary: Tüm aktif başarı hikayelerini getir (Public)
 *     tags: [Success Stories]
 *     parameters:
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [tr, en, ar]
 *           default: tr
 *         description: Dil seçimi
 *     responses:
 *       200:
 *         description: Başarı hikayeleri başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SuccessStory'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/public', cacheMiddleware(3600), successStoryController.getAllActiveSuccessStories);

/**
 * @swagger
 * /api/success-stories/featured:
 *   get:
 *     summary: Öne çıkan başarı hikayelerini getir (Public)
 *     tags: [Success Stories]
 *     parameters:
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [tr, en, ar]
 *           default: tr
 *         description: Dil seçimi
 *     responses:
 *       200:
 *         description: Öne çıkan başarı hikayeleri başarıyla getirildi
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
 *                     $ref: '#/components/schemas/SuccessStory'
 */
router.get('/featured', cacheMiddleware(1800), successStoryController.getFeaturedSuccessStories);

/**
 * @swagger
 * /api/success-stories/location/{location}:
 *   get:
 *     summary: Belirli lokasyondaki başarı hikayelerini getir (Public)
 *     tags: [Success Stories]
 *     parameters:
 *       - in: path
 *         name: location
 *         required: true
 *         schema:
 *           type: string
 *         description: Lokasyon adı
 *         example: Gaza
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [tr, en, ar]
 *           default: tr
 *         description: Dil seçimi
 *     responses:
 *       200:
 *         description: Lokasyon bazlı başarı hikayeleri başarıyla getirildi
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
 *                     $ref: '#/components/schemas/SuccessStory'
 */
router.get('/location/:location', cacheMiddleware(3600), successStoryController.getSuccessStoriesByLocation);

/**
 * @swagger
 * /api/success-stories/slug/{slug}:
 *   get:
 *     summary: Slug ile başarı hikayesi detayını getir (Public)
 *     tags: [Success Stories]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Hikaye slug'ı
 *         example: gazze-de-yeniden-umut
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [tr, en, ar]
 *           default: tr
 *         description: Dil seçimi
 *     responses:
 *       200:
 *         description: Başarı hikayesi başarıyla getirildi
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
 *                   $ref: '#/components/schemas/SuccessStory'
 *       404:
 *         description: Başarı hikayesi bulunamadı
 */
router.get('/slug/:slug', cacheMiddleware(3600), successStoryController.getSuccessStoryBySlug);

// ADMIN ROUTES
router.use(authMiddleware);

/**
 * @swagger
 * /api/success-stories:
 *   get:
 *     summary: Tüm başarı hikayelerini getir (Admin)
 *     tags: [Success Stories]
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
 *         description: Başarı hikayeleri başarıyla getirildi
 *       401:
 *         description: Yetkisiz erişim
 *       403:
 *         description: Yetki eksikliği
 */
router.get('/', checkPermission('media', 'read'), successStoryController.getAllSuccessStories);

/**
 * @swagger
 * /api/success-stories/{id}:
 *   get:
 *     summary: ID ile başarı hikayesi getir (Admin)
 *     tags: [Success Stories]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Başarı hikayesi ID
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [tr, en, ar]
 *           default: tr
 *     responses:
 *       200:
 *         description: Başarı hikayesi başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessStory'
 *       404:
 *         description: Başarı hikayesi bulunamadı
 */
router.get('/:id', checkPermission('media', 'read'), successStoryController.getSuccessStoryById);

/**
 * @swagger
 * /api/success-stories:
 *   post:
 *     summary: Yeni başarı hikayesi oluştur (Admin)
 *     tags: [Success Stories]
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
 *               coverImage:
 *                 type: string
 *                 example: /uploads/success-stories/cover.jpg
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               location:
 *                 type: string
 *                 example: Gaza
 *               country:
 *                 type: string
 *                 example: Filistin
 *               projectId:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *                 default: true
 *               isFeatured:
 *                 type: boolean
 *                 default: false
 *               displayOrder:
 *                 type: integer
 *                 default: 0
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
 *                     - slug
 *                   properties:
 *                     language:
 *                       type: string
 *                       enum: [tr, en, ar]
 *                     title:
 *                       type: string
 *                     slug:
 *                       type: string
 *                     summary:
 *                       type: string
 *                     content:
 *                       type: string
 *                     metaTitle:
 *                       type: string
 *                     metaDescription:
 *                       type: string
 *     responses:
 *       201:
 *         description: Başarı hikayesi başarıyla oluşturuldu
 *       400:
 *         description: Geçersiz veri
 *       401:
 *         description: Yetkisiz erişim
 */
router.post('/', checkPermission('media', 'create'), successStoryController.createSuccessStory);

/**
 * @swagger
 * /api/success-stories/{id}:
 *   put:
 *     summary: Başarı hikayesini güncelle (Admin)
 *     tags: [Success Stories]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Başarı hikayesi ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               coverImage:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               location:
 *                 type: string
 *               country:
 *                 type: string
 *               projectId:
 *                 type: integer
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
 *                   properties:
 *                     language:
 *                       type: string
 *                       enum: [tr, en, ar]
 *                     title:
 *                       type: string
 *                     slug:
 *                       type: string
 *                     summary:
 *                       type: string
 *                     content:
 *                       type: string
 *                     metaTitle:
 *                       type: string
 *                     metaDescription:
 *                       type: string
 *     responses:
 *       200:
 *         description: Başarı hikayesi başarıyla güncellendi
 *       404:
 *         description: Başarı hikayesi bulunamadı
 *       401:
 *         description: Yetkisiz erişim
 */
router.put('/:id', checkPermission('media', 'update'), successStoryController.updateSuccessStory);

/**
 * @swagger
 * /api/success-stories/{id}:
 *   delete:
 *     summary: Başarı hikayesini sil (Admin)
 *     tags: [Success Stories]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Başarı hikayesi ID
 *     responses:
 *       200:
 *         description: Başarı hikayesi başarıyla silindi
 *       404:
 *         description: Başarı hikayesi bulunamadı
 *       401:
 *         description: Yetkisiz erişim
 */
router.delete('/:id', checkPermission('media', 'delete'), successStoryController.deleteSuccessStory);

module.exports = router;
