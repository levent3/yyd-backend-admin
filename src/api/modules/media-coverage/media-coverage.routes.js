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
router.get('/', checkPermission('media', 'read'), mediaCoverageController.getAllMediaCoverage);
router.get('/:id', checkPermission('media', 'read'), mediaCoverageController.getMediaCoverageById);
router.post('/', checkPermission('media', 'create'), mediaCoverageController.createMediaCoverage);
router.put('/:id', checkPermission('media', 'update'), mediaCoverageController.updateMediaCoverage);
router.delete('/:id', checkPermission('media', 'delete'), mediaCoverageController.deleteMediaCoverage);

module.exports = router;
