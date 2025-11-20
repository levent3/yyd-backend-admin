const express = require('express');
const mediaCoverageController = require('./media-coverage.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/rbacMiddleware');
const { cacheMiddleware } = require('../../middlewares/cacheMiddleware');
const router = express.Router();

// PUBLIC ROUTES
router.get('/public', cacheMiddleware(3600), mediaCoverageController.getAllActiveMediaCoverage);
router.get('/featured', cacheMiddleware(1800), mediaCoverageController.getFeaturedMediaCoverage);

// ADMIN ROUTES
router.use(authMiddleware);

/**
 * @swagger
 * /api/media-coverage/import-from-website:
 *   post:
 *     summary: Import media coverage from YYD website
 *     description: One-time import to load media coverage from https://www.yyd.org.tr/tr/medya/basinda-biz
 *     tags: [Media Coverage]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Import completed successfully
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
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     success:
 *                       type: integer
 *                     error:
 *                       type: integer
 */
router.post('/import-from-website',
  checkPermission('media', 'create'),
  mediaCoverageController.importFromWebsite
);

router.get('/', checkPermission('media', 'read'), mediaCoverageController.getAllMediaCoverage);
router.get('/:id', checkPermission('media', 'read'), mediaCoverageController.getMediaCoverageById);
router.post('/', checkPermission('media', 'create'), mediaCoverageController.createMediaCoverage);
router.put('/:id', checkPermission('media', 'update'), mediaCoverageController.updateMediaCoverage);
router.delete('/:id', checkPermission('media', 'delete'), mediaCoverageController.deleteMediaCoverage);

module.exports = router;
