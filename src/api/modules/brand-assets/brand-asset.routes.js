const express = require('express');
const brandAssetController = require('./brand-asset.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/rbacMiddleware');
const { cacheMiddleware } = require('../../middlewares/cacheMiddleware');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     BrandAsset:
 *       type: object
 *       required:
 *         - fileName
 *         - fileType
 *         - fileUrl
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID
 *         fileName:
 *           type: string
 *           description: Dosya adı
 *           example: "YYD Logo Türkçe"
 *         fileType:
 *           type: string
 *           description: Dosya tipi
 *           enum: [logo, brand_guide, color_palette, font]
 *           example: "logo"
 *         fileUrl:
 *           type: string
 *           description: Dosya URL'i
 *           example: "/uploads/brand/yyd-logo-tr.pdf"
 *         thumbnailUrl:
 *           type: string
 *           description: Önizleme görseli
 *           example: "/uploads/brand/yyd-logo-tr-thumb.png"
 *         fileSize:
 *           type: integer
 *           description: Dosya boyutu (bytes)
 *           example: 524288
 *         language:
 *           type: string
 *           description: Dil
 *           enum: [tr, en, ar]
 *           example: "tr"
 *         version:
 *           type: string
 *           description: Versiyon
 *           example: "v2.0"
 *         description:
 *           type: string
 *           description: Açıklama
 *           example: "Türkçe logomuz - PDF formatında"
 *         isActive:
 *           type: boolean
 *           description: Aktif mi?
 *           example: true
 *         displayOrder:
 *           type: integer
 *           description: Sıralama
 *           example: 0
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
 * /api/brand-assets/type/{fileType}:
 *   get:
 *     summary: Get brand assets by file type (Public)
 *     description: Belirli bir dosya tipindeki tüm aktif brand asset'leri getir
 *     tags: [Brand Assets]
 *     parameters:
 *       - in: path
 *         name: fileType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [logo, brand_guide, color_palette, font]
 *         description: Dosya tipi
 *     responses:
 *       200:
 *         description: Brand assets successfully retrieved
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
 *                     $ref: '#/components/schemas/BrandAsset'
 */
router.get('/type/:fileType', cacheMiddleware(3600), brandAssetController.getAssetsByFileType);

// ========== ADMIN ROUTES (Auth required) ==========
router.use(authMiddleware);

/**
 * @swagger
 * /api/brand-assets:
 *   get:
 *     summary: Get all brand assets (Admin)
 *     description: Tüm brand asset'leri getir (pagination ile)
 *     tags: [Brand Assets]
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
 *         name: fileType
 *         schema:
 *           type: string
 *           enum: [logo, brand_guide, color_palette, font]
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [tr, en, ar]
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
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
 *                     $ref: '#/components/schemas/BrandAsset'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 */
router.get('/', checkPermission('media', 'read'), brandAssetController.getAllBrandAssets);

/**
 * @swagger
 * /api/brand-assets/{id}:
 *   get:
 *     summary: Get brand asset by ID (Admin)
 *     tags: [Brand Assets]
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
 *         description: Successfully retrieved
 *       404:
 *         description: Brand asset not found
 */
router.get('/:id', checkPermission('media', 'read'), brandAssetController.getBrandAssetById);

/**
 * @swagger
 * /api/brand-assets:
 *   post:
 *     summary: Create brand asset (Admin)
 *     tags: [Brand Assets]
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
 *               - fileName
 *               - fileType
 *               - fileUrl
 *             properties:
 *               fileName:
 *                 type: string
 *               fileType:
 *                 type: string
 *                 enum: [logo, brand_guide, color_palette, font]
 *               fileUrl:
 *                 type: string
 *               thumbnailUrl:
 *                 type: string
 *               fileSize:
 *                 type: integer
 *               language:
 *                 type: string
 *               version:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               displayOrder:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Brand asset created successfully
 */
router.post('/', checkPermission('media', 'create'), brandAssetController.createBrandAsset);

/**
 * @swagger
 * /api/brand-assets/{id}:
 *   put:
 *     summary: Update brand asset (Admin)
 *     tags: [Brand Assets]
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
 *             $ref: '#/components/schemas/BrandAsset'
 *     responses:
 *       200:
 *         description: Brand asset updated successfully
 *       404:
 *         description: Brand asset not found
 */
router.put('/:id', checkPermission('media', 'update'), brandAssetController.updateBrandAsset);

/**
 * @swagger
 * /api/brand-assets/{id}:
 *   delete:
 *     summary: Delete brand asset (Admin)
 *     tags: [Brand Assets]
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
 *         description: Brand asset deleted successfully
 *       404:
 *         description: Brand asset not found
 */
router.delete('/:id', checkPermission('media', 'delete'), brandAssetController.deleteBrandAsset);

module.exports = router;
