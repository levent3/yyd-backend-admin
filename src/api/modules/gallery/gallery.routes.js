const express = require('express');
const router = express.Router();
const galleryController = require('./gallery.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/permissionMiddleware');
const { cacheMiddleware } = require('../../middlewares/cacheMiddleware');

/**
 * @swagger
 * /gallery/public:
 *   get:
 *     summary: Get public gallery items
 *     description: Retrieve all gallery items with pagination (cached for 10 minutes)
 *     tags: [Gallery]
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
 *         name: mediaType
 *         schema:
 *           type: string
 *           enum: [image, video]
 *         description: Filter by media type
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: integer
 *         description: Filter by project ID
 *     responses:
 *       200:
 *         description: Gallery items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/GalleryItem'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 */
router.get('/public', cacheMiddleware(600), galleryController.getPublicGallery);

// Protected routes (require authentication)
router.use(authMiddleware);

// Admin routes with permission checks
router.get(
  '/',
  checkPermission('gallery', 'read'),
  galleryController.getAllGalleryItems
);

router.get(
  '/:id',
  checkPermission('gallery', 'read'),
  galleryController.getGalleryItemById
);

router.post(
  '/',
  checkPermission('gallery', 'create'),
  galleryController.createGalleryItem
);

router.put(
  '/:id',
  checkPermission('gallery', 'update'),
  galleryController.updateGalleryItem
);

router.delete(
  '/:id',
  checkPermission('gallery', 'delete'),
  galleryController.deleteGalleryItem
);

module.exports = router;
